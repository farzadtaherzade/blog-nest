import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiBody, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import { PermissionsGuard } from 'src/jwt-auth/permissions.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role, User } from 'src/users/entities/user.entity';
import { GetUser } from 'src/auth/decorators/user.decorator';

@Controller('posts')
@ApiTags("Posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Roles(Role.Admin, Role.Author)
  @ApiConsumes("application/x-www-form-urlencoded", "application/json")
  create(@Body() createPostDto: CreatePostDto, @GetUser() user: User) {
    createPostDto.author = user
    return this.postsService.create(createPostDto);
  }

  @Get()
  @ApiQuery({ name: "page", required: false, })
  @ApiQuery({ name: "keyword", required: false, })
  findAll(@Query('keyword') keyword: string, @Query("page") page: number) {
    return this.postsService.findAll(keyword, page);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Roles(Role.Admin, Role.Author)
  @ApiConsumes("application/x-www-form-urlencoded", "application/json")
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto, @GetUser() user: User) {
    return this.postsService.update(+id, updatePostDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Roles(Role.Admin, Role.Author)
  @ApiConsumes("application/x-www-form-urlencoded", "application/json")
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.postsService.remove(+id, user);
  }
}
