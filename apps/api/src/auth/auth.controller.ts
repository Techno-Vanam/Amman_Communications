import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';

class LoginDto {
  @ApiProperty({ description: 'Account email address', example: 'admin@test.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Account password', example: 'password123' })
  @IsString()
  @MinLength(8)
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

@ApiTags('Auth')
@Controller(['v1/auth', 'api/v1/auth', 'auth'])
export class AuthController {
  constructor(private readonly auth: AuthService) {}

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
  }
}
