import { Module } from '@nestjs/common';
import { UserBlogService } from './user-blog.service';
import { UserBlogController } from './user-blog.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogUser, UserSchema } from './user-blog.schema';
import { UserAuthModule } from '../user-auth/user-auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: BlogUser.name,
        schema: UserSchema,
      },
    ]),
    UserAuthModule,
  ],
  providers: [UserBlogService],
  controllers: [UserBlogController],
  exports: [UserBlogService, MongooseModule],
})
export class UserBlogModule {}
