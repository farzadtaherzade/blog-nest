import { generateRandomString } from './../helper/generate';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Post, StatusStory } from './entities/post.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { Role, User } from 'src/users/entities/user.entity';
import slugify from 'slugify';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
  ) {}
  async create(StoryDto: CreatePostDto, user: User) {
    const slug = generateRandomString(25);

    // create story and modified
    const story = this.postsRepository.create(StoryDto);
    story.slug = slug;
    story.authorId = user.id;
    if (user.permissions.includes(Role.Admin)) story.special = true;

    if (typeof StoryDto.tagsId === 'string')
      StoryDto.tagsId = Array.from(
        new Set(StoryDto.tagsId.split(',').map(Number)),
      );
    story.tags = (
      await Promise.all(
        StoryDto.tagsId.map(async (id: number) => {
          return await this.tagsRepository.findOne({ where: { id } });
        }),
      )
    ).filter((tag) => tag !== null);
    const save = await this.postsRepository.save(story);
    return save;
  }

  async uploadFile(file: Express.Multer.File, id: number, user: User) {
    const post = await this.postsRepository.findOne({
      where: {
        id,
        authorId: user.id,
      },
    });
    if (!post) throw new NotFoundException('post not found');

    if (post.cover) {
      const filePath = path.join('uploads', post.cover);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log('File deleted successfully');
      });
    }
    post.cover = file.filename;
    await this.postsRepository.save(post);
    return post;
  }

  async findAll(keyword: string, page: number = 1) {
    const perPage = 5;
    const skip = perPage * (page - 1);

    const where = keyword
      ? {
          title: Like(`%${keyword}%`),
          status: StatusStory.Published,
        }
      : {
          status: StatusStory.Published,
        };

    const totalPosts = await this.postsRepository.count({
      where,
    });

    const posts = await this.postsRepository.find({
      where,
      relations: {
        tags: true,
      },
      take: perPage,
      skip,
    });

    const total = totalPosts;
    const lastPage = Math.ceil(total / perPage);
    return {
      data: {
        posts,
      },
      paginate: {
        currentPage: +page,
        perPage,
        total,
        lastPage,
      },
    };
  }

  async findOne(id: number) {
    const post = await this.postsRepository.findOne({
      where: {
        id,
        status: StatusStory.Published,
      },
      relations: {
        author: true,
        tags: true,
      },
    });
    if (!post) throw new NotFoundException('post not found');
    return post;
  }

  async update(id: number, storyDto: UpdatePostDto, user: User) {
    const post = await this.postsRepository.findOne({
      where: {
        id,
        authorId: user.id,
      },
    });
    storyDto.slug = slugify(storyDto.slug + ' ' + post.slug);

    if (typeof storyDto.tagsId === 'string')
      storyDto.tagsId = Array.from(
        new Set(storyDto.tagsId.split(',').map(Number)),
      );

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    const updatedStory = { ...post, ...storyDto };

    updatedStory.tags = (
      await Promise.all(
        storyDto.tagsId.map(async (id: number) => {
          return await this.tagsRepository.findOne({ where: { id } });
        }),
      )
    ).filter((tag) => tag !== null);
    const result = await this.postsRepository.save(updatedStory);
    return result;
  }

  async remove(id: number, user: User) {
    const post = await this.postsRepository.findOne({
      where: {
        id,
        authorId: user.id,
      },
    });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    await this.postsRepository.remove(post, {});
    return post;
  }
}
