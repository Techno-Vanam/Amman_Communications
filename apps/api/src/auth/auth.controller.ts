import { Body, Controller, Post } from '@nestjs/common';
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

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const { accessToken, user } = await this.auth.login(dto.email, dto.password);
    return { accessToken, user };
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const { accessToken, user } = await this.auth.register(dto.name, dto.email, dto.password);
    return { accessToken, user };
  }
}
