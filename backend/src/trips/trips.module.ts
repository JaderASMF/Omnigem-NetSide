import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { SettingsModule } from '../settings/settings.module'
import { TripsService } from './trips.service'
import { TripsController } from './trips.controller'

@Module({
  imports: [PrismaModule, SettingsModule],
  controllers: [TripsController],
  providers: [TripsService],
  exports: [TripsService],
})
export class TripsModule {}
