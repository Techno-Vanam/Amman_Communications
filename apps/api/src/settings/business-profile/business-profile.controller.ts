import { Body, Controller, Delete, Get, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { BusinessProfileService } from './business-profile.service';
import { UpdateBusinessProfileDto } from './dto/update-business-profile.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';


@ApiTags('Admin - Business Profile Settings')
@ApiBearerAuth()
@Controller('admin/settings/business-profile')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class BusinessProfileController {
  constructor(private readonly businessProfileService: BusinessProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get current Business Profile', description: 'Returns the organization profile.' })
  @ApiResponse({ status: 200, description: 'Business Profile details.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admins only' })
  getProfile() {
    return this.businessProfileService.getProfile();
  }

  @Patch()
  @ApiOperation({ summary: 'Update or Create Business Profile', description: 'Updates organization profile details.' })
  @ApiResponse({ status: 200, description: 'Business profile successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failure.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admins only' })
  updateProfile(@Body() dto: UpdateBusinessProfileDto) {
    return this.businessProfileService.updateProfile(dto);
  }

  @Post('logo')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload or Replace Business Logo', description: 'Accepts PNG, JPG, JPEG, WebP up to 5MB.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (PNG, JPG, JPEG, WebP)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Logo successfully uploaded.' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admins only' })
  uploadLogo(@UploadedFile() file: { buffer: Buffer; mimetype: string; originalname: string; size: number }) {
    return this.businessProfileService.uploadLogo(file);
  }

  @Delete('logo')
  @ApiOperation({ summary: 'Remove Active Business Logo', description: 'Removes active logo from business profile.' })
  @ApiResponse({ status: 200, description: 'Logo successfully removed.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admins only' })
  deleteLogo() {
    return this.businessProfileService.deleteLogo();
  }
}
