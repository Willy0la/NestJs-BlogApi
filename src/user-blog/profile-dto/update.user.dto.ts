import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  @Length(2, 50, { message: 'Name must be between 2 and 50 characters' })
  name?: string;

  @IsString({ message: 'UserName must be a string' })
  @IsOptional()
  @Length(3, 20, { message: 'UserName must be between 3 and 20 characters' })
  userName?: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  @Matches(/^[a-zA-Z0-9._%+-]+\.com$/, {
    message: 'Email must be a valid email address ending in .com',
  })
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(8, { message: 'Password must have a minimum of 8 characters' })
  password?: string;
}
