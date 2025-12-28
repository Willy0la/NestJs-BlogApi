import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { BlogUser } from '../user-blog/user-blog.schema';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SignUpDto } from '../auth-dto/user.signup.dto';
import * as bcrypt from 'bcrypt';
import { SignInDto } from '../auth-dto/user.signin.dto';

@Injectable()
export class UserAuthService {
  private readonly logger = new Logger(UserAuthService.name);
  constructor(
    @InjectModel(BlogUser.name) private readonly userModel: Model<BlogUser>,
    private readonly jwtService: JwtService,
  ) {}
  private sanitizeUser(user: BlogUser) {
    return {
      id: user._id?.toString() ?? '',
      name: user.name,
      userName: user.userName,
      email: user.email,
    };
  }

  async signup(dto: SignUpDto): Promise<{
    message: string;
    data: {
      id: string;
      name: string;
      userName: string;
      email: string;
    };
    success: boolean;
    token: string;
  }> {
    try {
      const { name, userName, email, password } = dto;
      const user = await this.userModel.findOne({
        $or: [{ email }, { userName }],
      });
      if (user) {
        throw new BadRequestException('User already exists');
      }

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = await this.userModel.create({
        name: name,
        userName: userName,
        email: email,
        password: hashedPassword,
      });
      this.logger.log(newUser);

      const payload = { sub: newUser._id };
      const token = this.jwtService.sign(payload);
      return {
        message: 'New user successfully created',
        data: this.sanitizeUser(newUser),
        success: true,
        token,
      };
    } catch (error) {
      this.logger.error(error);
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Otherwise, throw the generic server error
      throw new InternalServerErrorException(
        'Unable to create new user, try again ...',
      );
    }
  }

  async signin(dto: SignInDto): Promise<{
    message: string;
    data: {
      id: string;
      name: string;
      userName: string;
      email: string;
    };
    success: boolean;
    token: string;
  }> {
    try {
      const MAX_FAILED_ATTEMPTS = 10;
      const LOCK_TIME = 15 * 60 * 1000;
      const { identifier, password } = dto;

      const existingUser = await this.userModel.findOne({
        $or: [{ email: identifier }, { userName: identifier }],
      });

      if (!existingUser) {
        throw new BadRequestException('Invalid email or username');
      }

      const now = new Date();

      if (existingUser.lockUntil && existingUser.lockUntil > now) {
        const secondsLeft = Math.ceil(
          (existingUser.lockUntil.getTime() - now.getTime()) / 1000,
        );
        throw new BadRequestException(
          `Account is locked. Try again in ${secondsLeft} seconds.`,
        );
      }

      const isMatch = await bcrypt.compare(password, existingUser.password);
      if (!isMatch) {
        existingUser.failedLoginAttempts =
          (existingUser.failedLoginAttempts || 0) + 1;

        if (existingUser.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
          existingUser.lockUntil = new Date(now.getTime() + LOCK_TIME);
        }
        await existingUser.save();
        throw new BadRequestException('Incorrect password');
      }

      existingUser.failedLoginAttempts = 0;
      existingUser.lockUntil = null;
      await existingUser.save();

      const payload = { sub: existingUser._id };
      const token = this.jwtService.sign(payload);

      return {
        message: 'Login successful',
        data: this.sanitizeUser(existingUser),
        success: true,
        token,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(error.message, error.stack);
      } else {
        this.logger.error(`Unknown error: ${String(error)}`);
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Unable to sign in, please try again',
      );
    }
  }
}
