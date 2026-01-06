import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any,): any {
    if (err || !user) {
      console.log('Guard Validation Failed. Info:');
      throw (
        err ||
        new UnauthorizedException(
          'Access Denied: ' + (info?.message || 'Invalid Token'),
        )
      );
    }
    return user;
  }
}
