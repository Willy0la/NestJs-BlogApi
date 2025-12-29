import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { BlogService, BlogResponse } from '../services/blog.service';
import { JwtAuthGuard } from '../guard/jwt.guard';
import { CreateBlogDto } from '../dtos/create.blog.dto';
import { UpdateBlogDto } from '../dtos/update.blog.dto';
import { FileInterceptor } from '@nestjs/platform-express';

interface RequestWithUser extends Request {
  user: {
    _id: string;
    [key: string]: any;
  };
}

@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  async getAllBlogs() {
    return this.blogService.findAll();
  }

  @Get(':id')
  async getBlog(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createBlog(
    @Body() dto: CreateBlogDto,
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.blogService.create(req.user._id.toString(), dto, file);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateBlog(
    @Param('id') id: string,
    @Body() dto: UpdateBlogDto,
    @Req() req: RequestWithUser,
  ) {
    return this.blogService.update(id, req.user._id.toString(), dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteBlog(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.blogService.remove(id, req.user._id.toString());
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/like')
  async toggleLike(@Param('id') blogId: string, @Req() req: any) {
    return this.blogService.toggleLike(blogId, req.user._id.toString());
  }
}
