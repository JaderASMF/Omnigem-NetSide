import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { VehicleExpensesService } from './vehicle-expenses.service'
import { VehicleExpensesController } from './vehicle-expenses.controller'

@Module({
  imports: [PrismaModule],
  providers: [VehicleExpensesService],
  controllers: [VehicleExpensesController],
  exports: [VehicleExpensesService],
})
export class VehicleExpensesModule {}
