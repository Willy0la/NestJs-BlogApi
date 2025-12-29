import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(150, { message: 'Title cannot exceed 150 characters' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  content: string;
}
