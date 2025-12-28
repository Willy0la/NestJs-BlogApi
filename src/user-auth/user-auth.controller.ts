import { Body, Controller, Post } from '@nestjs/common';
import { SignUpDto } from '../auth-dto/user.signup.dto';
import { UserAuthService } from './user-auth.service';
import { SignInDto } from '../auth-dto/user.signin.dto';

import { Request } from 'express';
@Controller('auth')
export class UserAuthController {
  constructor(private readonly authService: UserAuthService) {}

  @Post('signup')
  async signup(@Body() dto: SignUpDto) {
    return this.authService.signup(dto);
  }

  @Post('signin')
  async signin(@Body() dto: SignInDto) {
    return this.authService.signin(dto);
  }
}
