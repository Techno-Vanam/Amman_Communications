import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Password Reset Service
 *
 * Handles the complete password reset flow:
 * 1. Generate and store OTP for email verification
 * 2. Verify OTP and issue reset token
 * 3. Reset password using valid reset token
 * 4. Resend OTP with rate limiting
 *
 * SECURITY NOTES:
 * - OTPs are stored hashed (bcrypt) — never in plaintext
 * - Generic responses prevent email enumeration
 * - OTPs expire after 10 minutes
 * - Maximum 5 verification attempts per OTP
 * - Old tokens are invalidated when a new one is requested
 *
 * EMAIL INTEGRATION:
 * Currently logs OTP to console (development mode).
 * Replace sendOTPEmail() with a real email provider (SendGrid, SES, etc.)
 * when ready for production.
 */
@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  /** OTP validity duration in minutes */
  private readonly OTP_EXPIRY_MINUTES = 10;

  /** Max failed verification attempts before OTP is invalidated */
  private readonly MAX_ATTEMPTS = 5;

  /** Minimum interval between OTP requests for the same email (seconds) */
  private readonly RESEND_COOLDOWN_SECONDS = 60;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  // ─── Step 1: Request Password Reset (Forgot Password) ─────────────

  /**
   * Initiates the password reset flow.
   * Generates a 6-digit OTP, stores it hashed, and "sends" it via email.
   * Always returns success to prevent email enumeration.
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists (admin or customer)
    const [admin, customer] = await Promise.all([
      this.prisma.admin.findUnique({ where: { email: normalizedEmail } }),
      this.prisma.customer.findUnique({ where: { email: normalizedEmail } }),
    ]);

    const userExists = !!(admin || customer);

    if (!userExists) {
      // Return generic success — do NOT reveal that the email doesn't exist
      this.logger.log(`Password reset requested for non-existent email: ${normalizedEmail}`);
      return {
        success: true,
        message: 'If an account exists with this email address, a verification code has been sent.',
      };
    }

    // Rate limiting: check for recent OTP request
    const recentToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        email: normalizedEmail,
        used: false,
        createdAt: {
          gte: new Date(Date.now() - this.RESEND_COOLDOWN_SECONDS * 1000),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentToken) {
      this.logger.warn(`Rate limit: OTP recently sent to ${normalizedEmail}`);
      // Still return success to avoid information leak
      return {
        success: true,
        message: 'If an account exists with this email address, a verification code has been sent.',
      };
    }

    // Invalidate all previous unused tokens for this email
    await this.prisma.passwordResetToken.updateMany({
      where: { email: normalizedEmail, used: false },
      data: { used: true },
    });

    // Generate 6-digit OTP
    const otp = this.generateOTP();
    const otpHash = await hash(otp, 10);
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

    // Store hashed OTP
    await this.prisma.passwordResetToken.create({
      data: {
        email: normalizedEmail,
        otpHash,
        expiresAt,
      },
    });

    // Send OTP via email
    await this.sendOTPEmail(normalizedEmail, otp, admin?.name || customer?.name || 'User');

    this.logger.log(`Password reset OTP generated for: ${normalizedEmail}`);

    return {
      success: true,
      message: 'If an account exists with this email address, a verification code has been sent.',
    };
  }

  // ─── Step 2: Verify OTP ───────────────────────────────────────────

  /**
   * Verifies the OTP code and returns a time-limited reset token.
   */
  async verifyOTP(email: string, otp: string): Promise<{ success: boolean; token?: string; error?: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    // Find the most recent unused, non-expired token for this email
    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        email: normalizedEmail,
        used: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!resetToken) {
      return {
        success: false,
        error: 'Invalid or expired verification code. Please request a new one.',
      };
    }

    // Check max attempts
    if (resetToken.attempts >= this.MAX_ATTEMPTS) {
      // Invalidate the token
      await this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      });

      return {
        success: false,
        error: 'Too many failed attempts. Please request a new verification code.',
      };
    }

    // Increment attempt counter
    await this.prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { attempts: resetToken.attempts + 1 },
    });

    // Compare OTP
    const isValid = await compare(otp.trim(), resetToken.otpHash);

    if (!isValid) {
      const remainingAttempts = this.MAX_ATTEMPTS - (resetToken.attempts + 1);
      return {
        success: false,
        error: remainingAttempts > 0
          ? `Invalid verification code. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`
          : 'Too many failed attempts. Please request a new verification code.',
      };
    }

    // OTP is valid — mark as used and return the token for the reset step
    await this.prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    // Generate a short-lived JWT reset token (valid for 15 minutes)
    const jwtResetToken = await this.jwt.signAsync(
      {
        sub: normalizedEmail,
        purpose: 'password-reset',
        tokenId: resetToken.id,
      },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m',
      },
    );

    this.logger.log(`OTP verified successfully for: ${normalizedEmail}`);

    return {
      success: true,
      token: jwtResetToken,
    };
  }

  // ─── Step 3: Reset Password ────────────────────────────────────────

  /**
   * Resets the user's password using the verified reset token.
   */
  async resetPassword(
    email: string,
    resetToken: string,
    newPassword: string,
  ): Promise<{ success: boolean; error?: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    // Validate the reset token
    let payload: { sub: string; purpose: string; tokenId: string };
    try {
      payload = await this.jwt.verifyAsync(resetToken, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
    } catch {
      return {
        success: false,
        error: 'Reset token is invalid or has expired. Please restart the password reset process.',
      };
    }

    // Verify the token purpose and email match
    if (payload.purpose !== 'password-reset' || payload.sub !== normalizedEmail) {
      return {
        success: false,
        error: 'Invalid reset token.',
      };
    }

    // Validate password strength
    const passwordValidation = this.validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return {
        success: false,
        error: passwordValidation.error,
      };
    }

    // Hash the new password
    const passwordHash = await hash(newPassword, 10);

    // Update the password for admin or customer
    const [admin, customer] = await Promise.all([
      this.prisma.admin.findUnique({ where: { email: normalizedEmail } }),
      this.prisma.customer.findUnique({ where: { email: normalizedEmail } }),
    ]);

    if (admin) {
      await this.prisma.admin.update({
        where: { email: normalizedEmail },
        data: { passwordHash },
      });
    } else if (customer) {
      await this.prisma.customer.update({
        where: { email: normalizedEmail },
        data: { passwordHash },
      });
    } else {
      return {
        success: false,
        error: 'Account not found.',
      };
    }

    // Invalidate all remaining tokens for this email
    await this.prisma.passwordResetToken.updateMany({
      where: { email: normalizedEmail, used: false },
      data: { used: true },
    });

    this.logger.log(`Password reset successfully for: ${normalizedEmail}`);

    return { success: true };
  }

  // ─── Step 4: Resend OTP ────────────────────────────────────────────

  /**
   * Resends a new OTP to the user's email.
   * Enforces cooldown between resend requests.
   */
  async resendOTP(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    // Reuse the same logic as requestPasswordReset
    return this.requestPasswordReset(email);
  }

  // ─── Helpers ───────────────────────────────────────────────────────

  /**
   * Generates a cryptographically random 6-digit OTP.
   */
  private generateOTP(): string {
    // Use crypto for better randomness
    const array = new Uint32Array(1);
    // Node.js crypto
    const crypto = require('crypto');
    const randomValue = crypto.randomInt(0, 1000000);
    return randomValue.toString().padStart(6, '0');
  }

  /**
   * Validates password strength against requirements.
   */
  private validatePasswordStrength(password: string): { valid: boolean; error?: string } {
    if (password.length < 8) {
      return { valid: false, error: 'Password must be at least 8 characters long.' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, error: 'Password must contain at least one uppercase letter.' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, error: 'Password must contain at least one lowercase letter.' };
    }
    if (!/\d/.test(password)) {
      return { valid: false, error: 'Password must contain at least one number.' };
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return { valid: false, error: 'Password must contain at least one special character.' };
    }
    return { valid: true };
  }

  /**
   * Sends OTP via email.
   *
   * TODO: Replace with a real email service (SendGrid, AWS SES, Nodemailer, etc.)
   * For development, the OTP is logged to the console.
   */
  private async sendOTPEmail(email: string, otp: string, name: string): Promise<void> {
    // ──────────────────────────────────────────────────────────────
    // DEVELOPMENT: Log OTP to console
    // PRODUCTION: Replace this with your email provider integration
    // ──────────────────────────────────────────────────────────────
    this.logger.log(
      `\n` +
      `══════════════════════════════════════════════════════\n` +
      `  📧 PASSWORD RESET OTP\n` +
      `──────────────────────────────────────────────────────\n` +
      `  To:   ${email}\n` +
      `  Name: ${name}\n` +
      `  OTP:  ${otp}\n` +
      `  Expires in: ${this.OTP_EXPIRY_MINUTES} minutes\n` +
      `══════════════════════════════════════════════════════\n`,
    );

    // Example integration with Nodemailer / SendGrid / AWS SES:
    //
    // await this.emailService.send({
    //   to: email,
    //   subject: 'Amman Communications - Password Reset Code',
    //   html: `
    //     <h2>Hello ${name},</h2>
    //     <p>Your password reset verification code is:</p>
    //     <h1 style="letter-spacing: 8px; font-size: 32px;">${otp}</h1>
    //     <p>This code expires in ${this.OTP_EXPIRY_MINUTES} minutes.</p>
    //     <p>If you didn't request this, please ignore this email.</p>
    //     <br/>
    //     <p>— Amman Communications</p>
    //   `,
    // });
  }
}
