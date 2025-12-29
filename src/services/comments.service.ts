import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment } from '../schemas/comments.schema';
import { CreateCommentDto } from '../dtos/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}

  async create(userId: string, blogId: string, dto: CreateCommentDto) {
    const comment = await this.commentModel.create({
      content: dto.content,
      author: new Types.ObjectId(userId),
      blogId: new Types.ObjectId(blogId),
    });

    return comment;
  }

  async findByBlog(blogId: string) {
    return this.commentModel
      .find({ blogId: new Types.ObjectId(blogId), isDeleted: false })
      .populate('author', 'userName')
      .sort({ createdAt: -1 });
  }

  async update(commentId: string, userId: string, content: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment || comment.isDeleted)
      throw new NotFoundException('Comment not found');


    const authorId = comment.author.toString().trim();
    const currentUserId = String(userId).trim();



    if (comment.author.toString() !== userId.toString()) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    comment.content = content;
    return comment.save();
  }

  async remove(commentId: string, userId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');


    if (comment.author.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    comment.isDeleted = true;
    await comment.save();
    return { message: 'Comment deleted successfully' };
  }
}
