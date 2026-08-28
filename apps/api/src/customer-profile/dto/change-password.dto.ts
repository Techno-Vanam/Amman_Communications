import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  currentPassword!: string;

  @ApiProperty()
  @IsString()
  @ApiProperty()
  @MinLength(8)
  newPassword!: string;

  @ApiProperty()
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  confirmNewPassword!: string;
}
