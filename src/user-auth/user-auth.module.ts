import { Module } from '@nestjs/common';
import { UserAuthService } from './user-auth.service';
import { UserAuthController } from './user-auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../strategy/jwt.strategy';
import { BlogUser, UserSchema } from '../user-blog/user-blog.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([{ name: BlogUser.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        console.log('JWT Secret:', config.get('TOKEN'));
        console.log('JWT TTL:', config.get('TTL'));

        return {
          secret: config.get<string>('TOKEN'),
          signOptions: {
            expiresIn: config.get<string>('TTL') || '1d',
          },
        };
      },
    }),
  ],
  providers: [UserAuthService, JwtStrategy],
  controllers: [UserAuthController],
  exports: [PassportModule, JwtModule, UserAuthService],
})
export class UserAuthModule {}
