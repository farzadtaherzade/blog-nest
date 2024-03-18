import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { Like, Repository } from 'typeorm';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>
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

  async findOne(name: string) {
    const tag = await this.tagsRepository.findOne({
      where: {
        name
      },
      relations: {
        posts: true
      },
    })
    return tag
  }

  async update(id: number, updateTagDto: UpdateTagDto) {
    return `This action updates a #${id} tag`;
  }

  async remove(id: number) {
    return `This action removes a #${id} tag`;
  }
}
