import { Body, Controller, Post } from '@nestjs/common';
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
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User Login', description: 'Authenticates admin or customer and returns JWT access token.' })
  @ApiResponse({ status: 201, description: 'Authentication successful. Returns access token and user role.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() dto: LoginDto) {
    const { accessToken, user } = await this.auth.login(dto.email, dto.password);
    return { accessToken, user };
  }

  @Post('register')
  @ApiOperation({ summary: 'Customer Registration', description: 'Registers a new customer account.' })
  @ApiResponse({ status: 201, description: 'Registration successful. Returns access token and user info.' })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation error or duplicate email.' })
  async register(@Body() dto: RegisterDto) {
    const { accessToken, user } = await this.auth.register(dto.name, dto.email, dto.password);
    return { accessToken, user };
  }
}
