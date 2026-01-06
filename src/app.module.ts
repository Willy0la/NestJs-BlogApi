import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from './redis/redis.module';

// Controllers
import { AppController } from './controllers/app.controller';
import { BlogController } from './controllers/blog.controller';
import { CommentController } from './controllers/comments.controller';
import { UserAuthController } from './controllers/user-auth.controller';
import { UserBlogController } from './controllers/user-blog.controller';

// Services
import { AppService } from './services/app.service';
import { BlogService } from './services/blog.service';
import { CommentService } from './services/comments.service';
import { UserAuthService } from './services/user-auth.service';
import { UserBlogService } from './services/user-blog.service';
import { CloudinaryService } from './services/cloudinary.service';

// Schemas
import { Blog, BlogSchema } from './schemas/blog.schema';
import { Comment, CommentSchema } from './schemas/comments.schema';
import { BlogUser, UserSchema } from './schemas/user-blog.schema';

// Providers & Strategies
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.development.local', 'env.production'],
      isGlobal: true,
      validationSchema: Joi.object({
        NODE: Joi.string().valid(),
        DB: Joi.string().required(),
        TTL: Joi.string().required(),
        TOKEN: Joi.string().required(),
        CLOUDINARY_NAME: Joi.string().required(),
        CLOUDINARY_API_KEY: Joi.string().required(),
        CLOUDINARY_API_SECRET: Joi.string().required(),
        PORT: Joi.number().default(3000).required(),
         REDIS_URL: Joi.string().required()
      }),
    }),
JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('TOKEN'),
        signOptions: {
          expiresIn: '1d',
        },
      }),
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('DB'),
      }),
    }),

    // Register All Schemas
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: BlogUser.name, schema: UserSchema },
    ]),

    RedisModule,
  ],
  controllers: [
    AppController,
    BlogController,
    CommentController,
    UserAuthController,
    UserBlogController,
  ],
  providers: [
    AppService,
    BlogService,
    CommentService,
    UserAuthService,
    UserBlogService,
    CloudinaryService,
    JwtStrategy,
    // Inline Cloudinary Provider logic or import if I moved it
    {
      provide: 'CLOUDINARY',
      useFactory: (config: ConfigService) => {
        const cloudinary = require('cloudinary').v2;
        cloudinary.config({
          cloud_name: config.get('CLOUDINARY_NAME'),
          api_key: config.get('CLOUDINARY_API_KEY'),
          api_secret: config.get('CLOUDINARY_API_SECRET'),
        });
        return cloudinary;
      },
      inject: [ConfigService],
    },
  ],
})
export class AppModule {}
