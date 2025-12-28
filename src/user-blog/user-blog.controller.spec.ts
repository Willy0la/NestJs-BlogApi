import { Test, TestingModule } from '@nestjs/testing';
import { UserBlogController } from './user-blog.controller';

describe('UserBlogController', () => {
  let controller: UserBlogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserBlogController],
    }).compile();

    controller = module.get<UserBlogController>(UserBlogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
