import { Module } from '@nestjs/common'
import { VehicleExpenseCategoriesService } from './vehicle-expense-categories.service'
import { VehicleExpenseCategoriesController } from './vehicle-expense-categories.controller'

@Module({
  providers: [VehicleExpenseCategoriesService],
  controllers: [VehicleExpenseCategoriesController],
  exports: [VehicleExpenseCategoriesService],
})
export class VehicleExpenseCategoriesModule {}
