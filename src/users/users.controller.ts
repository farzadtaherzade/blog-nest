import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
  Query,
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
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileUploadDto } from 'src/posts/dto/upload-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/helper/multer.config';
import { UpdateProfileDto } from './dto/update-user.dto';
import { Pagination } from 'src/decorators/pagination.decorator';
import { ChangeUsernameDto } from './dto/user.dto';

@ApiBearerAuth()
@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@GetUser() user: User) {
    return this.usersService.getMe(user);
  }

  @Get(':username')
  @UseGuards(JwtAuthGuard)
  getUser(@GetUser() user: User, @Param('username') username: string) {
    return this.usersService.getUser(username, user);
  }

  @Get(':username/stories')
  @UseGuards(JwtAuthGuard)
  @Pagination()
  getUserPosts(
    @GetUser() user: User,
    @Param('username') username: string,
    @Query('page') page: number,
  ) {
    return this.usersService.getUserStories(username, user, +page);
  }

  @Get('/:username/followrs')
  @UseGuards(JwtAuthGuard)
  @Pagination()
  getFollowrs(
    @Param('username') username: string,
    @Query('page') page: number,
  ) {
    return this.usersService.getFollowrs(username, page);
  }

  @Get('/:username/following')
  @UseGuards(JwtAuthGuard)
  @Pagination()
  getFollowing(
    @Param('username') username: string,
    @Query('page') page: number,
  ) {
    return this.usersService.getFollowing(username, page);
  }

  @Patch(':username/follow')
  @UseGuards(JwtAuthGuard)
  // @Roles(Role.Admin, Role.Author)
  followToggle(@GetUser() user: User, @Param('username') username: string) {
    return this.usersService.followToggle(username, user);
  }

  @Put('/profile')
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  updateProfile(@GetUser() user: User, @Body() updateDto: UpdateProfileDto) {
    return this.usersService.updateProfile(updateDto, user);
  }

  @Patch('/change-username')
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  changeUsername(
    @GetUser() user: User,
    @Body() changeUsername: ChangeUsernameDto,
  ) {
    return this.usersService.changeUsername(user, changeUsername);
  }

  @Get('/check-username')
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  checkUsername(@Body() changeUsername: ChangeUsernameDto) {
    const check = this.usersService.checkUsername(changeUsername.username);
    return check ? 'username exists' : 'username not exists';
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
  uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User,
  ) {
    return this.usersService.uploadAvatar(file, user.profile.id);
  }
}
