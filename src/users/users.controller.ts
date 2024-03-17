import { Controller, Get, SetMetadata, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/user.decorator';
import { Role, User } from './entities/user.entity';
import { PermissionsGuard } from 'src/jwt-auth/permissions.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Roles(Role.Author, Role.User, Role.Author)
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }
}
