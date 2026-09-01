import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CustomerProfileService } from './customer-profile.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateContactInfoDto } from './dto/update-contact-info.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';


interface RequestWithUser {
  user: {
    customerId?: string;
    sub?: string;
    role?: string;
  };
}

@ApiTags('Customer - Profile')
@ApiBearerAuth()
@Controller('customer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CUSTOMER')
export class CustomerProfileController {
  constructor(private readonly profileService: CustomerProfileService) {}

  private getCustomerId(req: RequestWithUser): string {
    return req.user.customerId || req.user.sub || '';
  }

  @Get(['profile', 'me'])
  @ApiOperation({ summary: 'Get current customer profile information' })
  async getProfile(@Req() req: RequestWithUser) {
    return this.profileService.getProfile(this.getCustomerId(req));
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update basic profile details' })
  async updateProfile(@Req() req: RequestWithUser, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(this.getCustomerId(req), dto);
  }

  @Patch('password')
  @ApiOperation({ summary: 'Change account password' })
  async changePassword(@Req() req: RequestWithUser, @Body() dto: ChangePasswordDto) {
    return this.profileService.changePassword(this.getCustomerId(req), dto);
  }

  @Get('contact-info')
  @ApiOperation({ summary: 'Get secondary contact information' })
  async getContactInfo(@Req() req: RequestWithUser) {
    return {
      altContactName: null,
      altPhoneNumber: null,
      preferredContactMethod: 'EMAIL',
    };
  }

  @Patch('contact-info')
  @ApiOperation({ summary: 'Update secondary contact information' })
  async updateContactInfo(@Req() req: RequestWithUser, @Body() dto: UpdateContactInfoDto) {
    return this.profileService.updateContactInfo(this.getCustomerId(req), dto);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get notification and app preferences' })
  async getPreferences(@Req() req: RequestWithUser) {
    return {
      emailNotifications: true,
      smsAlerts: true,
      whatsappUpdates: true,
      preferredLanguage: 'en',
    };
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update notification and app preferences' })
  async updatePreferences(@Req() req: RequestWithUser, @Body() dto: UpdatePreferencesDto) {
    return this.profileService.updatePreferences(this.getCustomerId(req), dto);
  }
}
