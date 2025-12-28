import { Controller, Get, Patch, Body, Req, UseGuards } from '@nestjs/common';
import { UserBlogService } from './user-blog.service';
import { UpdateProfileDto } from './profile-dto/update.user.dto';
import { Request } from 'express';
import { JwtAuthGuard } from '../guard/jwt.guard';

@Controller('user-blog')
@UseGuards(JwtAuthGuard)
export class UserBlogController {
  constructor(private readonly userService: UserBlogService) {}

  @Get('profile')
  async getProfile(@Req() req: Request) {

    const user = req.user as any;
    return this.userService.getProfile(user._id);
  }

  @Patch('profile')
  async updateProfile(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    const user = req.user as any;
    return this.userService.updateProfile(user._id, dto);
  }
}
