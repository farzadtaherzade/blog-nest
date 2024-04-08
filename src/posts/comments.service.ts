import { InjectRepository } from '@nestjs/typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Post, StatusStory } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  async create(createCommentDto: CreateCommentDto, id: number) {
    if (createCommentDto.parentId) {
      const oldComment = await this.commentsRepository.findOne({
        where: {
          id: +createCommentDto.parentId,
        },
      });
      if (!oldComment)
        throw new NotFoundException(
          'comment your want to reply not found check that comment is exist!',
        );
      createCommentDto.parent = oldComment;
    }
    createCommentDto.parentId = null;
    const post = await this.postsRepository.findOne({
      where: {
        id,
      },
    });
    if (!post) throw new NotFoundException('post not found');
    createCommentDto.post = post;
    const comment = this.commentsRepository.create(createCommentDto);
    const savecomment = await this.commentsRepository.save(comment);
    return savecomment;
  }

  async findAll(id: number, page: number = 1) {
    const perPage = 5;
    const skip = perPage * (page - 1);
    const total = await this.commentsRepository.count({
      where: {
        postId: id,
        post: {
          status: StatusStory.Published,
        },
      },
    });
    const comments = await this.commentsRepository.find({
      where: {
        postId: id,
        post: {
          status: StatusStory.Published,
        },
      },
      relations: {
        user: true,
      },
      take: perPage,
      skip,
    });

    const lastPage = Math.ceil(total / perPage);
    return {
      data: {
        comments,
      },
      paginate: {
        currentPage: +page,
        perPage,
        total,
        lastPage,
      },
    };
  }

  async remove(id: number, user: User) {
    const comment = await this.commentsRepository.findOne({
      where: {
        id,
        user_id: user.id,
      },
    });
    await this.commentsRepository.remove(comment);
    return 'comment deleted successfully';
  }

  async findOne(postId: number, commentId: number, page: number = 1) {
    page = page <= 0 ? 1 : page;
    const perPage = 10;
    const skip = perPage * (page - 1);
    const comment = await this.commentsRepository.findOne({
      where: {
        id: commentId,
        postId,
      },
    });
    if (!comment) throw new NotFoundException('comment not found');
    const post = await this.postsRepository.findOne({
      where: {
        id: postId,
      },
    });

    // comments
    const comments = await this.commentsRepository.find({
      where: {
        parent_id: comment.id,
      },
      skip,
      take: perPage,
    });
    const total = await this.commentsRepository.count({
      where: {
        parent_id: comment.id,
      },
    });
    const lastPage = Math.ceil(total / perPage);
    return {
      data: {
        parent_comment: comment,
        post,
        comments,
      },
      paginate: {
        currentPage: +page,
        perPage,
        total,
        lastPage,
      },
    };
  }
}
