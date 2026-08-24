import { Body, Controller, Post } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';

class LoginDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(8) password!: string;
}

@Controller()
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('customer/auth/login') customerLogin(@Body() dto: LoginDto) { return this.auth.login('customer', dto.email, dto.password); }
  @Post('admin/auth/login') adminLogin(@Body() dto: LoginDto) { return this.auth.login('admin', dto.email, dto.password); }
}
