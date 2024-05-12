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
import { paginationGen } from 'src/utils/pagination-gen';
import { CommentsService } from './comments.service';
import { LikeStory } from './entities/story-like.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(LikeStory)
    private likesRepository: Repository<LikeStory>,
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
    private commentService: CommentsService,
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

  async findAll(keyword: string, page: number = 1, user: User) {
    const limit = 5;
    const skip = limit * (page - 1);

    const where = keyword
      ? [
          {
            title: Like(`%${keyword}%`),
            status: StatusStory.Published,
          },
          {
            title: Like(`%${keyword}%`),
            status: StatusStory.ForSale,
          },
        ]
      : {
          status: StatusStory.Published,
        };

    const [stories, count] = await this.postsRepository.findAndCount({
      where,
      relations: {
        tags: true,
      },
      take: limit,
      skip,
    });

    for (let i = 0; i < stories.length; i++) {
      stories[i]['commentsCount'] =
        await this.commentService.countCommentByPostId(stories[i].id);

      stories[i]['likes'] = await this.likesRepository.countBy({
        target_id: stories[i].id,
      });
      stories[i]['liked'] = await this.likesRepository.existsBy({
        target_id: stories[i].id,
        user_id: user.id,
      });
    }

    return {
      data: {
        stories,
      },
      paginate: paginationGen(count, limit, +page),
    };
  }

  async findOne(id: number, user: User) {
    const story = await this.postsRepository.findOne({
      where: {
        id,
        status: StatusStory.Published,
      },
      relations: {
        author: true,
        tags: true,
      },
    });
    story['likes'] = await this.likesRepository.countBy({
      target_id: id,
    });
    story['liked'] = await this.likesRepository.existsBy({
      target_id: id,
      user_id: user.id,
    });
    if (!story) throw new NotFoundException('post not found');
    return story;
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

  async toggleLike(id: number, user: User) {
    const story = await this.findStoryById(id);
    const liked = await this.likesRepository.findOne({
      where: {
        target_id: story.id,
        user_id: user.id,
      },
    });
    if (!liked) {
      const like = this.likesRepository.create({
        target_id: story.id,
        user_id: user.id,
      });
      await this.likesRepository.save(like);
      return {
        data: {
          message: 'story liked successfully',
        },
      };
    }
    await this.likesRepository.remove(liked);
    return {
      data: {
        message: 'story unliked successfully',
      },
    };
  }

  async findStoryById(id: number) {
    const story = await this.postsRepository.findOneBy({ id });
    if (!story) throw new NotFoundException('Story Not Found');
    return story;
  }
}
