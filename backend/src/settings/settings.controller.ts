import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common'
import { SettingsService } from './settings.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'

class UpdateMealDto { value!: number }

@Controller('settings')
export class SettingsController {
  constructor(private service: SettingsService) {}

  @Get('mealExpense')
  async getMeal() {
    const value = await this.service.getDefaultMealExpense()
    return { value }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put('mealExpense')
  async setMeal(@Body() body: UpdateMealDto) {
    await this.service.set('defaultMealExpense', String(body.value))
    return { value: body.value }
  }
}
