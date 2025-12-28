import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import { Blog } from './blog.schema';
import { UpdateBlogDto } from './blog-dto/update.blog.dto';
import { CreateBlogDto } from './blog-dto/create.blog.dto';
import { Comment } from '../comments/comments.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import Redis from 'ioredis';
import { Inject } from '@nestjs/common';
export interface BlogResponse {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    userName?: string;
  };
  likesCount: number;
  commentsCount: number;
  coverImage?: { publicId: string; url: string };
  createdAt: Date;
}

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(
    @InjectModel(Blog.name)
    private readonly blogModel: Model<Blog>,
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
    private readonly cloudinaryService: CloudinaryService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}


  private sanitizeBlog(
    blog: Blog & Document & { createdAt?: Date },
    commentsCount: number = 0,
  ): BlogResponse {

    const authorData = blog.author as
      | Types.ObjectId
      | { _id: Types.ObjectId; userName?: string };


    let authorId: string;
    let authorUserName: string | undefined;

    if (authorData && typeof authorData === 'object' && '_id' in authorData) {

      authorId = authorData._id.toString();
      authorUserName =
        'userName' in authorData ? authorData.userName : undefined;
    } else {

      authorId = (authorData as Types.ObjectId).toString();
      authorUserName = undefined;
    }

    return {
      id: blog._id.toString(),
      title: blog.title,
      content: blog.content,
      author: {
        id: authorId,
        userName: authorUserName,
      },
      likesCount: blog.likes?.length || 0,
      commentsCount: commentsCount,
      coverImage: blog.coverImage,
      createdAt: blog.createdAt!,
    };
  }



  async create(userId: string, dto: CreateBlogDto, file?: Express.Multer.File) {
    try {
      let coverImage;

      if (file) {
        const result = await this.cloudinaryService.uploadImage(file);
        coverImage = {
          publicId: result.public_id,
          url: result.secure_url,
        };
      }

      const blog = await this.blogModel.create({
        ...dto,
        author: new Types.ObjectId(userId),
        coverImage,
      });

      await this.redis.del('blogs_all'); // Invalidate cache

      return {
        success: true,
        message: 'Blog created successfully',
        data: this.sanitizeBlog(blog),
      };
    } catch (error) {
      this.logger.error(`Create Error: ${error.message}`);
      throw new InternalServerErrorException('Failed to create blog');
    }
  }



  async findAll() {
    const cached = await this.redis.get('blogs_all');
    if (cached) {
      return JSON.parse(cached);
    }

    const blogs = await this.blogModel
      .find({ isDeleted: false })
      .populate('author', 'userName')
      .sort({ createdAt: -1 });

    const data = await Promise.all(
      blogs.map(async (blog) => {
        const count = await this.commentModel.countDocuments({
          blogId: blog._id,
          isDeleted: false,
        });
        return this.sanitizeBlog(blog, count);
      }),
    );
    
    const result = { success: true, data };
    await this.redis.set('blogs_all', JSON.stringify(result), 'EX', 60); // Cache for 1 min
    return result;
  }



  async findOne(blogId: string) {
    const blog = await this.blogModel
      .findOne({ _id: blogId, isDeleted: false })
      .populate('author', 'userName')
      .exec();

    if (!blog) {
      throw new NotFoundException('Blog not found or has been removed');
    }


    const commentsCount = await this.commentModel.countDocuments({
      blogId: blog._id,
      isDeleted: false,
    });

    return {
      success: true,
      data: this.sanitizeBlog(blog, commentsCount),
    };
  }


  async update(blogId: string, userId: string, dto: UpdateBlogDto) {
    const blog = await this.blogModel.findOne({
      _id: blogId,
      isDeleted: false,
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }


    if (blog.author.toString() !== userId) {
      throw new ForbiddenException('You are not allowed to edit this blog');
    }


    Object.assign(blog, dto);
    const updatedBlog = await blog.save();

    await this.redis.del('blogs_all'); // Invalidate cache

    return {
      success: true,
      message: 'Blog updated successfully',
      data: this.sanitizeBlog(updatedBlog),
    };
  }



  async remove(blogId: string, userId: string) {
    const blog = await this.blogModel.findOne({
      _id: blogId,
      isDeleted: false,
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    if (blog.author.toString() !== userId) {
      throw new ForbiddenException('You are not allowed to delete this blog');
    }

    blog.isDeleted = true;
    await blog.save();

    await this.redis.del('blogs_all'); // Invalidate cache

    return {
      success: true,
      message: 'Blog deleted successfully',
    };
  }


  async toggleLike(blogId: string, userId: any) {
    const blog = await this.blogModel.findById(blogId);
    if (!blog || blog.isDeleted) {
      throw new NotFoundException('Blog not found');
    }

    const userIdStr = userId.toString();
    const hasLiked = blog.likes.some((id) => id.toString() === userIdStr);

    const updateAction = hasLiked
      ? { $pull: { likes: userId } }
      : { $addToSet: { likes: userId } };


    const updatedBlog = await this.blogModel
      .findByIdAndUpdate(blogId, updateAction, { new: true })
      .populate('author', 'userName');

    if (!updatedBlog) {
      throw new NotFoundException('Blog not found');
    }

    await this.redis.del('blogs_all'); // Invalidate cache

    const commentsCount = await this.commentModel.countDocuments({
      blogId: blogId,
      isDeleted: false,
    });
    return {
      success: true,
      message: hasLiked ? 'Like removed' : 'Blog liked',
      commentsCount: commentsCount,
      data: this.sanitizeBlog(updatedBlog as any, commentsCount),
    };
  }
}
