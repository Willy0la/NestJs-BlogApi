import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogUser } from '../schemas/user-blog.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(BlogUser.name) private readonly userModel: Model<BlogUser>,
  ) {
    const secret = configService.get<string>('TOKEN');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in configuration');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }
  async validate(payload: { sub: string }) {
    const user = await this.userModel.findById(payload.sub).select('-password');

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    // Optional: Kick out users if their account was locked after they logged in
    if (user.lockUntil && user.lockUntil > new Date()) {
      throw new UnauthorizedException('Account is currently locked');
    }

    return user;
  }
}
