import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class UpdateBusinessProfileDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  businessName!: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  registrationNumber?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  officeAddress!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[+]?[\d\s\-()]{7,20}$/, {
    message: 'primaryPhone must be a valid phone number format',
  })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  primaryPhone!: string;

  @IsEmail({}, { message: 'supportEmail must be a valid email address' })
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  supportEmail!: string;
}
