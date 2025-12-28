import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentController } from './comments.controller'; // Removed the 's'
import { CommentService } from './comments.service'; // Removed the 's'
import { Comment, CommentSchema } from './comments.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
  ],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentsModule {}
