import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AuthService } from './auth.service';

class LoginDto {
  @ApiProperty({ example: 'admin@amman.com' })
  @IsEmail() email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString() @MinLength(8) password!: string;
}

class RegisterDto {
  @ApiProperty({ example: 'Admin User' })
  @IsString() @MinLength(2) name!: string;

  @ApiProperty({ example: 'admin@amman.com' })
  @IsEmail() email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString() @MinLength(8) password!: string;
}

@ApiTags('Authentication')
@Controller(['auth', 'v1/auth'])
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Customer & Admin login' })
  @ApiResponse({ status: 200, description: 'JWT access token returned' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    const { accessToken, user } = await this.auth.login(dto.email, dto.password);
    return { accessToken, user };
  }

  @Post('register')
  @ApiOperation({ summary: 'Customer registration' })
  @ApiResponse({ status: 201, description: 'Customer account created' })
  @ApiResponse({ status: 400, description: 'Registration failed or email exists' })
  async register(@Body() dto: RegisterDto) {
    const { accessToken, user } = await this.auth.register(dto.name, dto.email, dto.password);
    return { accessToken, user };
  }
}
