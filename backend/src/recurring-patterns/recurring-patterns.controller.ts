import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { RecurringPatternsService } from './recurring-patterns.service';

class CreateRecurringPatternDto {
  workerId: number;
  weekdays: number[];
  weekInterval?: number;
  weekOffset?: number;
  startDate?: string;
  endDate?: string;
  note?: string;
}

class UpdateRecurringPatternDto {
  workerId?: number;
  weekdays?: number[];
  weekInterval?: number | null;
  weekOffset?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  note?: string | null;
}

@Controller('recurring-patterns')
export class RecurringPatternsController {
  constructor(private svc: RecurringPatternsService) {}

  @Get()
  list() {
    return this.svc.list();
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.svc.get(id);
  }

  @Post()
  create(@Body() body: CreateRecurringPatternDto) {
    return this.svc.create(body as any);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateRecurringPatternDto) {
    return this.svc.update(id, body as any);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
