import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { BlogUser } from '../schemas/user-blog.schema';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SignUpDto } from '../dtos/user.signup.dto';
import * as bcrypt from 'bcrypt';
import { SignInDto } from '../dtos/user.signin.dto';

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
    token: string;
    success: boolean;
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
      this.logger.log(`User created: ${newUser._id.toString()}`);

      const payload = { sub: newUser._id };
      const token = this.jwtService.sign(payload);
      return {
        message: 'New user successfully created',
        data: this.sanitizeUser(newUser),
        token,
        success: true,
      };
    } catch (error) {
      this.logger.error(error);
      if (error instanceof BadRequestException) {
        throw error;
      }

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
      const MAX_FAILED_ATTEMPTS = 5;
      const LOCK_TIME = 15 * 60 * 1000;
      const { identifier, password } = dto;

      const existingUser = await this.userModel.findOne({
        $or: [{ email: identifier }, { userName: identifier }],
      });

      if (!existingUser) {
        throw new BadRequestException('Invalid credentials');
      }

      // unlock time logic
      const now = new Date();

      if (existingUser.lockUntil && existingUser.lockUntil > now) {
        throw new BadRequestException(
          `Account is temporarily locked. Please try again later.`,
        );
      }

      const isMatch = await bcrypt.compare(password, existingUser.password);

      // account password trial and lockout
      if (!isMatch) {
        // increment failed login attempts
        existingUser.failedLoginAttempts =
          (existingUser.failedLoginAttempts || 0) + 1;

        // lock account if max attempts reached
        if (existingUser.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
          existingUser.lockUntil = new Date(now.getTime() + LOCK_TIME);
        }

        await existingUser.save();
        throw new BadRequestException('Incorrect password');
      }

      // login attempt reset for password and expired lock
      if (
        existingUser.failedLoginAttempts > 0 ||
        (existingUser.lockUntil && existingUser.lockUntil <= now)
      ) {
        existingUser.failedLoginAttempts = 0;
        existingUser.lockUntil = null;
        await existingUser.save();
      }

      // create payload using the userId
      const payload = { sub: existingUser._id, purpose: 'signup' };
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
