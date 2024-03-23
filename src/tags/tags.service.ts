import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { Like, Repository } from 'typeorm';
import { Post } from 'src/posts/entities/post.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>
  ) { }
  async create(createTagDto: CreateTagDto) {
    const tag = await this.tagsRepository.findOne({
      where: {
        name: createTagDto.name
      }
    })
    if (tag) throw new BadRequestException("tag Already Exist")
    const newTag = this.tagsRepository.create(createTagDto)
    return await this.tagsRepository.save(newTag)

  }

  async findAll(search: string) {
    const where = search ? {
      name: Like(`%${search}%`)
    } : {}
    const tags = await this.tagsRepository.findAndCount({
      where,
      select: {
        name: true,
        id: true
      }
    })
    return tags;
  }

  async findOne(name: string, page: number = 1) {
    const perPage = 5
    const skip = perPage * (page - 1)

    const tag = await this.tagsRepository.findOne({
      where: {
        name
      },
      select: {
        name: true,
      },

    })
    if (!tag) throw new NotFoundException("Tag Not Found")
    const postsCheck = await this.postRepository.find({
      where: {
        tags: tag
      },
      select: {
        title: true
      }
    })

    const posts = await this.postRepository.find({
      where: {
        tags: tag
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
        currentPage: page,
        perPage,
        total,
        lastPage
      },
      meta: {
        tag,
        totalAuthor: this.countUniqueAuthorsInPost(posts)
      }
    }
  }

  async update(id: number, updateTagDto: UpdateTagDto) {
    return `This action updates a #${id} tag`;
  }

  async remove(id: number) {
    return `This action removes a #${id} tag`;
  }

  countUniqueAuthorsInPost(post: Post[]): number {
    const uniqueAuthors = new Set(post.map(author => author.id === author.id));
    return uniqueAuthors.size;
  }
}
