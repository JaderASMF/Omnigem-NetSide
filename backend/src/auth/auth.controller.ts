import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

class LoginDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    const { email, password } = body;
    return this.authService.login(email, password);
  }

  /** Returns the current user info decoded from the JWT */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: any) {
    return { id: req.user.sub, email: req.user.email, roles: req.user.roles };
  }
}
