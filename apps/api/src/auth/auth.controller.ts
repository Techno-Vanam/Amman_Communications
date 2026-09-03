import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { PasswordResetService } from './password-reset.service';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

export class VerifyResetOtpDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  otp!: string;
}

export class ResetPasswordDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}

export class ResendOtpDto {
  @IsEmail()
  email!: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly passwordReset: PasswordResetService,
  ) {}

  private setRefreshCookie(response: Response, token: string) {
    response.cookie('refresh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private clearRefreshCookie(response: Response) {
    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
    });
  }

  private getRefreshToken(request: Request): string | undefined {
    if (request.cookies?.refresh_token) {
      return request.cookies.refresh_token;
    }
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
  }

  @Get('me')
  @ApiOperation({ summary: 'Get Current Authenticated User' })
  async me(@Req() request: Request) {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }
    const token = authHeader.slice(7);
    const user = await this.auth.getUserFromAccessToken(token);
    return { user };
  }

  @Post('verify-session')
  @ApiOperation({ summary: 'Verify Session without rotating refresh token' })
  async verifySession(@Req() request: Request) {
    const refreshToken = this.getRefreshToken(request);
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }
    return this.auth.verifySession(refreshToken);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh Access Token' })
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = this.getRefreshToken(request);
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }
    const session = await this.auth.refresh(refreshToken);
    this.setRefreshCookie(response, session.refreshToken);
    return { accessToken: session.accessToken, user: session.user };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout and Revoke Session' })
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = this.getRefreshToken(request);
    await this.auth.logout(refreshToken);
    this.clearRefreshCookie(response);
    return { success: true };
  }
}
