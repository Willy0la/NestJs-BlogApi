import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../guard/jwt.guard';
import { CommentService } from './comments.service';
import { CreateCommentDto } from './comment-dto/create-comment.dto';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get(':blogId')
  async getComments(@Param('blogId') blogId: string) {
    return this.commentService.findByBlog(blogId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':blogId')
  async addComment(
    @Param('blogId') blogId: string,
    @Body() dto: CreateCommentDto,
    @Req() req: any,
  ) {
    return this.commentService.create(req.user._id, blogId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateComment(
    @Param('id') id: string,
    @Body('content') content: string,
    @Req() req: any,
  ) {
    return this.commentService.update(id, req.user._id, content);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteComment(@Param('id') id: string, @Req() req: any) {
    return this.commentService.remove(id, req.user._id);
  }
}
