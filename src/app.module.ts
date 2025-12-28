import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserBlogModule } from './user-blog/user-blog.module';
import { UserAuthModule } from './user-auth/user-auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogModule } from './blog/blog.module';
import { CommentsModule } from './comments/comments.module';
import { RedisModule } from './redis/redis.module';

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
      }),
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('DB'),
      }),
    }),

    UserBlogModule,
    UserAuthModule,
    BlogModule,
    CommentsModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
