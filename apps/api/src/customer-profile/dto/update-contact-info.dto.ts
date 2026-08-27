import { IsOptional, IsString } from 'class-validator';

export class UpdateContactInfoDto {
  @IsOptional()
  @IsString()
  altContactName?: string;

  @IsOptional()
  @IsString()
  altPhoneNumber?: string;

  @IsOptional()
  @IsString()
  preferredContactMethod?: string;
}
