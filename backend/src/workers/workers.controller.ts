import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { WorkersService } from './workers.service';

class CreateWorkerDto {
  name: string;
  email?: string;
  color?: string;
}

class UpdateWorkerDto {
  name?: string;
  email?: string;
  color?: string;
  active?: boolean;
}

@Controller('workers')
export class WorkersController {
  constructor(private svc: WorkersService) {}

  @Get()
  list() {
    return this.svc.list();
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.svc.get(id);
  }

  @Post()
  create(@Body() body: CreateWorkerDto) {
    return this.svc.create(body);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateWorkerDto) {
    return this.svc.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Query('removeAssignments') removeAssignments?: string) {
    const flag = removeAssignments === '1' || removeAssignments === 'true' || removeAssignments === 'yes'
    return this.svc.remove(id, flag);
  }
}
