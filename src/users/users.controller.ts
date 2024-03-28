import {
  Controller,
  Get,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import { GetUser } from 'src/decorators/user.decorator';
import { Role, User } from './entities/user.entity';
import { PermissionsGuard } from 'src/jwt-auth/permissions.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileUploadDto } from 'src/posts/dto/upload-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/helper/multer.config';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Roles(Role.Author, Role.User, Role.Author)
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @Patch('/avatar')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Roles(Role.Admin, Role.Author)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'List of cats',
    type: FileUploadDto,
  })
  @UseInterceptors(
    FileInterceptor('cover', {
      dest: './files',
      storage: multerOptions.storage,
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File, @GetUser() user: User) {
    return this.usersService.uploadAvatar(file, user.id);
  }
}
