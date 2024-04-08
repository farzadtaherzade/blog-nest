import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiBody, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import { PermissionsGuard } from 'src/jwt-auth/permissions.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role, User } from 'src/users/entities/user.entity';
import { GetUser } from 'src/decorators/user.decorator';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadDto } from './dto/upload-post.dto';
import { multerOptions } from 'src/helper/multer.config';
import { FilterStory } from 'src/decorators/filter.decorator';
import { Pagination } from 'src/decorators/pagination.decorator';

@Controller('posts')
@ApiTags('Posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Roles(Role.Admin, Role.Author)
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  create(@Body() createPostDto: CreatePostDto, @GetUser() user: User) {
    return this.postsService.create(createPostDto, user);
  }

  @Patch(':id/cover')
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
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
    @GetUser() user: User,
  ) {
    return this.postsService.uploadFile(file, +id, user);
  }

  @Get()
  @Pagination()
  @FilterStory()
  findAll(@Query('keyword') keyword: string, @Query('page') page: number) {
    return this.postsService.findAll(keyword, page);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Roles(Role.Admin, Role.Author)
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @GetUser() user: User,
  ) {
    return this.postsService.update(+id, updatePostDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Roles(Role.Admin, Role.Author)
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.postsService.remove(+id, user);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Roles(Role.Admin, Role.Author)
  createComments(
    @Body() createCommentDto: CreateCommentDto,
    @Param('id') id: string,
    @GetUser() user: User,
  ) {
    createCommentDto.user = user;
    return this.commentsService.create(createCommentDto, +id);
  }

  @Get(':id/comments')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Roles(Role.Admin, Role.Author)
  @ApiQuery({ name: 'page', required: false })
  findAllComments(@Param('id') id: string, @Query('page') page: number) {
    return this.commentsService.findAll(+id, page);
  }

  @Get(':id/comments/:commentId')
  @ApiQuery({ name: 'page', required: false })
  findOneComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @Query('page') page: number,
  ) {
    return this.commentsService.findOne(+id, +commentId, page);
  }

  @Delete(':id/comments/:commentId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Roles(Role.Admin, Role.Author)
  removeComments(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @GetUser() user: User,
  ) {
    return this.commentsService.remove(+commentId, user);
  }
}
