import { Body, Controller, Post } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';

class LoginDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(8) password!: string;
}

class RegisterDto {
  @IsString() @MinLength(2) name!: string;
  @IsEmail() email!: string;
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
