import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    console.log('--- RAW HEADER CHECK ---');
    console.log('Authorization Header:', authHeader);

    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      console.log('Guard Validation Failed. Info:', info?.message);
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
