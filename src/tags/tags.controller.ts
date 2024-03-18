import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import { PermissionsGuard } from 'src/jwt-auth/permissions.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/entities/user.entity';
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags("tags")
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) { }

  @Roles(Role.Author, Role.Admin)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBody({ type: CreateTagDto })
  @Post()
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  @Get('')
  @ApiQuery({ name: "search", required: false })
  findAll(@Query("search") search: string) {
    return this.tagsService.findAll(search);
  }

  @Get(':name')
  @ApiParam({ name: "name" })
  findOne(@Param('name') name: string) {
    return this.tagsService.findOne(name);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagsService.update(+id, updateTagDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tagsService.remove(+id);
  }
}
