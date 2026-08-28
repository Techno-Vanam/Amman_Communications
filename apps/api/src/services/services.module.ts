import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';

@Module({
  imports: [JwtModule],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
