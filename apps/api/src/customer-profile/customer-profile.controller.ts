import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { CustomerAuthGuard } from '../auth/guards/customer-auth.guard';
import { CustomerProfileService } from './customer-profile.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateContactInfoDto } from './dto/update-contact-info.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller(['customer', 'v1/customer', 'api/v1/customer'])
@UseGuards(CustomerAuthGuard)
export class CustomerProfileController {
  constructor(private readonly profileService: CustomerProfileService) {}

  @Get(['profile', 'me'])
  async getProfile(@Req() req: { user: { customerId: string } }) {
    return this.profileService.getProfile(req.user.customerId);
  }

  @Patch('profile')
  async updateProfile(@Req() req: { user: { customerId: string } }, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(req.user.customerId, dto);
  }

  @Patch('password')
  async changePassword(@Req() req: { user: { customerId: string } }, @Body() dto: ChangePasswordDto) {
    return this.profileService.changePassword(req.user.customerId, dto);
  }

  @Get('contact-info')
  async getContactInfo(@Req() req: { user: { customerId: string } }) {
    return {
      altContactName: null,
      altPhoneNumber: null,
      preferredContactMethod: 'EMAIL',
    };
  }

  @Patch('contact-info')
  async updateContactInfo(@Req() req: { user: { customerId: string } }, @Body() dto: UpdateContactInfoDto) {
    return this.profileService.updateContactInfo(req.user.customerId, dto);
  }

  @Get('preferences')
  async getPreferences(@Req() req: { user: { customerId: string } }) {
    return {
      emailNotifications: true,
      smsAlerts: true,
      whatsappUpdates: true,
      preferredLanguage: 'en',
    };
  }

  @Patch('preferences')
  async updatePreferences(@Req() req: { user: { customerId: string } }, @Body() dto: UpdatePreferencesDto) {
    return this.profileService.updatePreferences(req.user.customerId, dto);
  }
}
