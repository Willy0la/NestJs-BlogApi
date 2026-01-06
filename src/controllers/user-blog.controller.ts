import { Controller, Get, Patch, Body, Req, UseGuards } from '@nestjs/common';
import { UserBlogService } from '../services/user-blog.service';
import { UpdateProfileDto } from '../dtos/update.user.dto';
import { Request } from 'express';
import { JwtAuthGuard } from '../guard/jwt.guard';

interface AuthUser {
  _id: string;
  [key: string]: any;
}

interface AuthRequest extends Request {
  user: AuthUser;
}

@Controller('user-blog')
@UseGuards(JwtAuthGuard)
export class UserBlogController {
  constructor(private readonly userService: UserBlogService) {}

  @Get('profile')
  async getProfile(@Req() req: AuthRequest) {
    const user = req.user;
    return this.userService.getProfile(user._id);
  }

  @Patch('profile')
  async updateProfile(@Req() req: AuthRequest, @Body() dto: UpdateProfileDto) {
    const user = req.user;
    return this.userService.updateProfile(user._id, dto);
  }
}
