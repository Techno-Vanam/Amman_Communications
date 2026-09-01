import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, Length, Matches } from 'class-validator';
import { AuthService } from './auth.service';
import { PasswordResetService } from './password-reset.service';

class LoginDto {
  @ApiProperty({ description: 'Account email address', example: 'admin@test.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Account password', example: 'password123' })
  @IsString()
  @MinLength(1)
  password!: string;
}

class RegisterDto {
  @ApiProperty({ description: 'Full name of the user', example: 'Test Customer' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ description: 'Account email address', example: 'customer@test.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Account password', example: 'password123' })
  @IsString()
  @MinLength(8)
  password!: string;
}

class ForgotPasswordDto {
  @ApiProperty({ description: 'Email address to send reset code to', example: 'user@example.com' })
  @IsEmail()
  email!: string;
}

class VerifyResetOtpDto {
  @ApiProperty({ description: 'Email address associated with the reset request', example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: '6-digit verification code', example: '123456' })
  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'OTP must contain only digits' })
  otp!: string;
}

class ResetPasswordDto {
  @ApiProperty({ description: 'Email address associated with the reset request', example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Reset token received after OTP verification' })
  @IsString()
  token!: string;

  @ApiProperty({ description: 'New password (min 8 chars, uppercase, lowercase, number, special char)', example: 'NewPass@123' })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}

class ResendOtpDto {
  @ApiProperty({ description: 'Email address to resend the reset code to', example: 'user@example.com' })
  @IsEmail()
  email!: string;
}

@ApiTags('Auth')
<<<<<<< HEAD
@Controller('auth')
=======
@Controller(['v1/auth', 'api/v1/auth', 'auth'])
>>>>>>> origin/backend-merge
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly passwordReset: PasswordResetService,
  ) {}

  private setRefreshCookie(response: Response, token: string) {
    response.cookie('refresh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private clearRefreshCookie(response: Response) {
    response.clearCookie('refresh_token', { httpOnly: true, sameSite: 'lax', path: '/' });
  }

  private getRefreshToken(request: Request) {
    const cookieHeader = request.headers.cookie ?? '';
    return cookieHeader
      .split(';')
      .map((part) => part.trim().split('='))
      .find(([name]) => name === 'refresh_token')?.[1];
  }

  @Post('login')
  @ApiOperation({ summary: 'User Login', description: 'Authenticates admin or customer and returns JWT access token.' })
  @ApiResponse({ status: 201, description: 'Authentication successful. Returns access token and user role.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const { accessToken, refreshToken, user } = await this.auth.login(dto.email, dto.password);
    this.setRefreshCookie(response, refreshToken);
    return { accessToken, user };
  }

  @Post('register')
  @ApiOperation({ summary: 'Customer Registration', description: 'Registers a new customer account.' })
  @ApiResponse({ status: 201, description: 'Registration successful. Returns access token and user info.' })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation error or duplicate email.' })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    const { accessToken, refreshToken, user } = await this.auth.register(dto.name, dto.email, dto.password);
    this.setRefreshCookie(response, refreshToken);
    return { accessToken, user };
  }

<<<<<<< HEAD
  // ─── Password Reset Endpoints ───────────────────────────────────

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Request Password Reset',
    description: 'Sends a 6-digit OTP to the provided email address. Returns generic success to prevent email enumeration.',
  })
  @ApiResponse({ status: 201, description: 'Reset request processed. Generic success response.' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const result = await this.passwordReset.requestPasswordReset(dto.email);
    return { success: result.success, message: result.message };
  }

  @Post('verify-reset-otp')
  @ApiOperation({
    summary: 'Verify Reset OTP',
    description: 'Verifies the 6-digit OTP code and returns a time-limited reset token.',
  })
  @ApiResponse({ status: 201, description: 'OTP verified successfully. Returns reset token.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP.' })
  async verifyResetOtp(@Body() dto: VerifyResetOtpDto) {
    const result = await this.passwordReset.verifyOTP(dto.email, dto.otp);
    if (!result.success) {
      return { success: false, message: result.error };
    }
    return { success: true, message: 'Email verified successfully.', data: { token: result.token } };
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset Password',
    description: 'Resets the user password using a verified reset token.',
  })
  @ApiResponse({ status: 201, description: 'Password reset successful.' })
  @ApiResponse({ status: 400, description: 'Invalid token or weak password.' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const result = await this.passwordReset.resetPassword(dto.email, dto.token, dto.newPassword);
    if (!result.success) {
      return { success: false, message: result.error };
    }
    return { success: true, message: 'Password has been reset successfully.' };
  }

  @Post('resend-reset-otp')
  @ApiOperation({
    summary: 'Resend Reset OTP',
    description: 'Resends a new OTP for password reset. Subject to cooldown rate limiting.',
  })
  @ApiResponse({ status: 201, description: 'OTP resent successfully.' })
  async resendResetOtp(@Body() dto: ResendOtpDto) {
    const result = await this.passwordReset.resendOTP(dto.email);
    return { success: result.success, message: result.message };
=======
  @Get('me')
  @ApiOperation({ summary: 'Get Current Authenticated User' })
  async me(@Req() request: Request) {
    const authHeader = request.headers.authorization;
    let token: string | undefined;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else {
      const cookieHeader = request.headers.cookie ?? '';
      token = cookieHeader
        .split(';')
        .map((part) => part.trim().split('='))
        .find(([name]) => name === 'access_token')?.[1];
    }
    if (!token) throw new UnauthorizedException('Missing access token');
    const user = await this.auth.getUserFromAccessToken(token);
    return { user };
  }

  @Post('refresh')
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = this.getRefreshToken(request);
    if (!refreshToken) throw new UnauthorizedException('Refresh token is missing');
    const session = await this.auth.refresh(refreshToken);
    this.setRefreshCookie(response, session.refreshToken);
    return { accessToken: session.accessToken, user: session.user };
  }

  @Post('logout')
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    await this.auth.logout(this.getRefreshToken(request));
    this.clearRefreshCookie(response);
    return { success: true };
>>>>>>> origin/backend-merge
  }
}

