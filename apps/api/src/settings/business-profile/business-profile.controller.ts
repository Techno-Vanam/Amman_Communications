import { Body, Controller, Delete, Get, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminAuthGuard } from '../../auth/guards/admin-auth.guard';
import { BusinessProfileService } from './business-profile.service';
import { UpdateBusinessProfileDto } from './dto/update-business-profile.dto';

@Controller('v1/admin/settings/business-profile')
@UseGuards(AdminAuthGuard)
export class BusinessProfileController {
  constructor(private readonly businessProfileService: BusinessProfileService) {}

  @Get()
  getProfile() {
    return this.businessProfileService.getProfile();
  }

  @Patch()
  updateProfile(@Body() dto: UpdateBusinessProfileDto) {
    return this.businessProfileService.updateProfile(dto);
  }

  @Post('logo')
  @UseInterceptors(FileInterceptor('file'))
  uploadLogo(@UploadedFile() file: { buffer: Buffer; mimetype: string; originalname: string; size: number }) {
    return this.businessProfileService.uploadLogo(file);
  }

  @Delete('logo')
  deleteLogo() {
    return this.businessProfileService.deleteLogo();
  }
}
