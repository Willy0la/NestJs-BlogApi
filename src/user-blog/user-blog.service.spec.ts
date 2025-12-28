import { Test, TestingModule } from '@nestjs/testing';
import { UserBlogService } from './user-blog.service';

describe('UserBlogService', () => {
  let service: UserBlogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserBlogService],
    }).compile();

    service = module.get<UserBlogService>(UserBlogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
