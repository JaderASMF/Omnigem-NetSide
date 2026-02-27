import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';

class CreateAssignmentDto {
  date: string;
  workerId?: number;
  note?: string;
}

class GenerateDto {
  startDate: string;
  endDate: string;
}

@Controller('assignments')
export class AssignmentsController {
  constructor(private svc: AssignmentsService) {}

  @Get()
  list(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.svc.list({ startDate, endDate });
  }

  @Post()
  create(@Body() body: CreateAssignmentDto) {
    return this.svc.createManual(body);
  }

  @Post('generate')
  generate(@Body() body: GenerateDto) {
    return this.svc.generate(body.startDate, body.endDate);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
