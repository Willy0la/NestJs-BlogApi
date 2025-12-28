import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class SignUpDto {
  @IsString({ message: 'Name must be an alphabet' })
  @IsNotEmpty({ message: 'Name cannot be left empty' })
  name: string;

  @IsString({ message: 'UserName must be an alphabet' })
  @IsNotEmpty({ message: 'UserName cannot be left empty' })
  userName: string;

  @IsString()
  @IsNotEmpty({ message: 'Email cannot be left empty' })
  @Matches(/^[a-zA-Z0-9._%+-]+\.com$/, {
    message: 'Email must be a valid email address',
  })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  @MinLength(8, { message: 'Password must have a minimum of 8 characters' })
  password: string;
}
