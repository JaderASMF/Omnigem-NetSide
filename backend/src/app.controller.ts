import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  root() {
    return { statusCode: 200, message: 'Backend API running' };
  }
}
