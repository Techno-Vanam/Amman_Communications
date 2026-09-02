import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { AdminPreferencesService } from './admin-preferences.service';
import { UpdateAdminPreferencesDto } from './dto/update-admin-preferences.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('admin/settings/preferences')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminPreferencesController {
  constructor(private readonly preferencesService: AdminPreferencesService) {}

  @Get()
  getPreferences(@Req() req: any) {
    const adminId = req.user.sub;
    return this.preferencesService.getPreferences(adminId);
  }

  @Patch()
  updatePreferences(@Req() req: any, @Body() dto: UpdateAdminPreferencesDto) {
    const adminId = req.user.sub;
    return this.preferencesService.updatePreferences(adminId, dto);
  }
}
