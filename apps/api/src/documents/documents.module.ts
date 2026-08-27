import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CustomerDocumentsController } from './customer-documents.controller';
import { AdminDocumentsController } from './admin-documents.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, StorageModule, AuthModule],
  controllers: [CustomerDocumentsController, AdminDocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
