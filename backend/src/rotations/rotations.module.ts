import { Module } from '@nestjs/common';
import { RotationsService } from './rotations.service';
import { RotationsController } from './rotations.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [RotationsService],
  controllers: [RotationsController],
  exports: [RotationsService],
})
export class RotationsModule {}
