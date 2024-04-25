import { InjectRepository } from '@nestjs/typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Post, StatusStory } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { User } from 'src/users/entities/user.entity';
import { paginationGen } from 'src/utils/pagination-gen';

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
          'comment your want to reply not found check comment is exist!',
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
    const limit = 5;
    const offset = limit * (page - 1);
    const where = {
      postId: id,
      post: {
        status: StatusStory.Published,
      },
    };

    // SELECT C.*, COUNT(`CC`.`id`) AS `child` FROM `comment` `C` LEFT JOIN `comment` `CC` ON `CC`.`parent_id`=`C`.`id` WHERE `C`.`post_id` = 10 GROUP BY `C`.`id` LIMIT 5
    const [comments, count] = await this.commentsRepository.findAndCount({
      where,
      relations: {
        user: true,
      },

      skip: offset,
      take: limit,
    });

    for (let i = 0; i < comments.length; i++) {
      comments[i].replies = await this.commentsRepository.count({
        where: {
          parent_id: comments[i].id,
          post: {
            status: StatusStory.Published,
          },
        },
      });
    }

    return {
      data: {
        comments,
      },
      paginate: paginationGen(count, limit, +page),
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
    const limit = 10;
    const skip = limit * (page - 1);
    const comment = await this.commentsRepository.findOne({
      where: {
        id: commentId,
        postId,
      },
      relations: {
        post: true,
      },
    });

    if (!comment) throw new NotFoundException('comment not found');

    comment.replies = await this.commentsRepository.count({
      where: {
        parent_id: comment.id,
        post: {
          status: StatusStory.Published,
        },
      },
    });

    // comments
    const [comments, count] = await this.commentsRepository.findAndCount({
      where: {
        parent_id: comment.id,
      },
      skip,
      take: limit,
    });

    return {
      data: {
        parent_comment: comment,
        post: comment.post,
        comments,
      },
      paginate: paginationGen(count, limit, +page),
    };
  }

  async countCommentByPostId(post_id: number): Promise<number> {
    const count: number = await this.commentsRepository.countBy({
      postId: post_id,
    });
    return count;
  }
}
