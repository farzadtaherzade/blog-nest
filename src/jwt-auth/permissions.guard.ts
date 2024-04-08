import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, User } from 'src/users/entities/user.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const permissions: [Role] = this.reflector.get(
      'roles',
      context.getHandler(),
    );
    const user: User = request.user;

    const userHasPermission = user.permissions.every((value: Role) =>
      permissions.includes(value),
    );

    if (!userHasPermission) {
      throw new UnauthorizedException(
        'You do not have the necessary permissions.',
      );
    }
    return true;
  }
}
