import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { HolidaysService } from './holidays.service';

class CreateHolidayDto {
  date: string;
  name?: string;
  recurring?: boolean;
}

class UpdateHolidayDto {
  date?: string;
  name?: string;
  recurring?: boolean;
}

@Controller('holidays')
export class HolidaysController {
  constructor(private svc: HolidaysService) {}

  @Get()
  list() {
    return this.svc.list();
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.svc.get(id);
  }

  @Post()
  create(@Body() body: CreateHolidayDto) {
    return this.svc.create(body);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateHolidayDto) {
    return this.svc.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
