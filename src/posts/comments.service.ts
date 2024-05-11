import { InjectRepository } from '@nestjs/typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Post, StatusStory } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { User } from 'src/users/entities/user.entity';
import { paginationGen } from 'src/utils/pagination-gen';
import { LikeComment } from './entities/comment-like.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(LikeComment)
    private likesRepository: Repository<LikeComment>,
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

  async findAll(id: number, page: number = 1, user: User) {
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
      comments[i]['likes'] = await this.likesRepository.count({
        where: {
          target_id: comments[i].id,
        },
      });
      comments[i]['liked'] = await this.likesRepository.existsBy({
        target_id: comments[i].id,
        user_id: user.id,
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
    const comment = await this.findCommentByIdAndUser(id, user.id);
    await this.commentsRepository.remove(comment);
    return 'comment deleted successfully';
  }

  async findOne(
    postId: number,
    commentId: number,
    page: number = 1,
    user: User,
  ) {
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

    comment['liked'] = await this.likesRepository.existsBy({
      target_id: comment.id,
      user_id: user.id,
    });

    comment['likes'] = await this.likesRepository.count({
      where: {
        target_id: comment.id,
      },
    });

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

    for (let i = 0; i < comments.length; i++) {
      comments[i].replies = await this.commentsRepository.count({
        where: {
          parent_id: comments[i].id,
          post: {
            status: StatusStory.Published,
          },
        },
      });
      comments[i]['likes'] = await this.likesRepository.count({
        where: {
          target_id: comments[i].id,
        },
      });

      comments[i]['liked'] = await this.likesRepository.existsBy({
        target_id: comments[i].id,
        user_id: user.id,
      });
    }

    return {
      data: {
        parent_comment: comment,
        post: comment.post,
        comments,
      },
      paginate: paginationGen(count, limit, +page),
    };
  }

  async toggleLike(id: number, user: User, postId: number) {
    const comment = await this.findCommentById(id, postId);
    const liked = await this.likesRepository.findOne({
      where: {
        target_id: comment.id,
        user_id: user.id,
      },
    });
    if (!liked) {
      const like = this.likesRepository.create({
        target_id: comment.id,
        user_id: user.id,
      });
      await this.likesRepository.save(like);
      return {
        data: {
          message: 'comment liked successfully',
        },
      };
    }
    await this.likesRepository.remove(liked);
    return {
      data: {
        message: 'comment unliked successfully',
      },
    };
  }

  //? helper functions
  async countCommentByPostId(post_id: number): Promise<number> {
    const count: number = await this.commentsRepository.countBy({
      postId: post_id,
    });
    return count;
  }

  async findCommentById(id: number, postId: number) {
    const comment = await this.commentsRepository.findOneBy({ id, postId });
    if (!comment) throw new NotFoundException('comment not found');
    return comment;
  }

  async findCommentByIdAndUser(id: number, userId: number) {
    const comment = await this.commentsRepository.findOneBy({
      id,
      user_id: userId,
    });
    if (!comment) throw new NotFoundException('comment not found');
    return comment;
  }
}
