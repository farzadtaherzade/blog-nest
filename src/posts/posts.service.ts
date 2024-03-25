import { generateRandomString } from './../helper/generate';
import { Injectable, NotFoundException, Query } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { User } from 'src/users/entities/user.entity';
import slugify from 'slugify';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>
  ) { }
  async create(createPostDto: CreatePostDto) {
    const slug = generateRandomString(25)
    createPostDto.slug = slug;
    const story = this.postsRepository.create(createPostDto);
    if (typeof createPostDto.tagsId === 'string') createPostDto.tagsId = String(createPostDto.tagsId).split(",").map(id => parseInt(id));
    story.tags = await Promise.all(createPostDto.tagsId.map(async id => {
      return await this.tagsRepository.findOne({
        where: {
          id
        }
      });
    }));
    const save = await this.postsRepository.save(story)
    return save;
  }

  async uploadFile(file: Express.Multer.File, id: number, user: User) {
    const post = await this.postsRepository.findOne({
      where: {
        id,
        authorId: user.id
      },
    })
    if (!post) throw new NotFoundException("post not found")

    if (post.cover) {
      const filePath = path.join('uploads', post.cover)
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log('File deleted successfully');
      })
    }
    post.cover = file.filename
    await this.postsRepository.save(post)
    return post
  }

  async findAll(keyword: string, page: number = 1) {
    const perPage = 5
    const skip = perPage * (page - 1)

    const where = keyword ? {
      title: Like(`%${keyword}%`),
      published: true
    } : {
      published: true
    }

    const postsCheck = await this.postsRepository.find({
      where,
      select: {
        title: true
      }
    })

    const posts = await this.postsRepository.find({
      where,
      relations: {
        tags: true
      },
      take: perPage,
      skip,
    })

    const total = postsCheck.length
    const lastPage = Math.ceil(total / perPage)
    return {
      data: {
        posts
      },
      paginate: {
        currentPage: +page,
        perPage,
        total,
        lastPage
      },
    }
  }

  async findOne(id: number) {
    const post = await this.postsRepository.findOne({
      where: {
        id,
        published: true
      },
      relations: {
        author: true,
        tags: true
      }
    })
    if (!post) throw new NotFoundException("post not found")
    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto, user: User) {
    const post = await this.postsRepository.findOne({
      where: {
        id,
        authorId: user.id
      }
    });
    updatePostDto.slug = slugify(updatePostDto.slug + " " + post.slug)
    if (typeof updatePostDto.tagsId === 'string') updatePostDto.tagsId = String(updatePostDto.tagsId).split(",").map(id => parseInt(id));

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    const updatedPost = { ...post, ...updatePostDto };
    updatedPost.tags = await Promise.all(updatePostDto.tagsId.map(async id => {
      return await this.tagsRepository.findOne({
        where: {
          id
        }
      });
    }));
    const result = await this.postsRepository.save(updatedPost);
    return result;
  }

  async remove(id: number, user: User) {
    const post = await this.postsRepository.findOne({
      where: {
        id,
        authorId: user.id
      }
    });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    const result = await this.postsRepository.remove(post, {})
    return post;
  }
}
