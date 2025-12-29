import { Body, Controller, Post } from '@nestjs/common';
import { SignUpDto } from '../dtos/user.signup.dto';
import { UserAuthService } from '../services/user-auth.service';
import { SignInDto } from '../dtos/user.signin.dto';

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
