import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { Comment } from './entities/comment.entity';
import { CommentsService } from './comments.service';
import { LikeComment } from './entities/comment-like.entity';
import { LikeStory } from './entities/story-like.entity';
import { Follow } from 'src/users/entities/follow.entity';
import { CopyPost } from './entities/copy-post.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Post,
      Tag,
      Comment,
      LikeComment,
      LikeStory,
      Follow,
      CopyPost,
    ]),
  ],
  controllers: [PostsController],
  providers: [PostsService, CommentsService],
})
export class PostsModule {}
