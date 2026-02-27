import { Module } from '@nestjs/common';
import { RecurringPatternsService } from './recurring-patterns.service';
import { RecurringPatternsController } from './recurring-patterns.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [RecurringPatternsService],
  controllers: [RecurringPatternsController],
  exports: [RecurringPatternsService],
})
export class RecurringPatternsModule {}
