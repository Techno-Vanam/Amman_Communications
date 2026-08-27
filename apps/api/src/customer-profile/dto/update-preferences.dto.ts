import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  smsAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  whatsappUpdates?: boolean;

  @IsOptional()
  @IsString()
  preferredLanguage?: string;
}
