import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CustomerAuthGuard } from '../auth/guards/customer-auth.guard';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@ApiTags('Customer - Applications')
@ApiBearerAuth()
@Controller('customer/applications')
@UseGuards(CustomerAuthGuard)
export class CustomerApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  async listApplications(@Req() req: { user: { sub: string } }) {
    return this.applicationsService.listCustomerApplications(req.user.sub);
  }

  @Get(':applicationId')
  async getApplication(
    @Req() req: { user: { sub: string } },
    @Param('applicationId') applicationId: string,
  ) {
    return this.applicationsService.getCustomerApplicationById(
      req.user.sub,
      applicationId,
    );
  }

  @Post()
  async createApplication(
    @Req() req: { user: { sub: string } },
    @Body() dto: CreateApplicationDto,
  ) {
    return this.applicationsService.createApplication(req.user.sub, dto);
  }

  @Put(':applicationId')
  async updateApplication(
    @Req() req: { user: { sub: string } },
    @Param('applicationId') applicationId: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.applicationsService.updateApplication(
      req.user.sub,
      applicationId,
      dto,
    );
  }
}
