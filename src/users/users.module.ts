import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Follow } from './entities/follow.entity';
import { Profile } from './entities/profile.entity';
import { Post } from 'src/posts/entities/post.entity';
import { Comment } from 'src/posts/entities/comment.entity';
import { CommentsService } from 'src/posts/comments.service';
import { LikeComment } from 'src/posts/entities/comment-like.entity';
import { LikeStory } from 'src/posts/entities/story-like.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Profile,
      Follow,
      Post,
      Comment,
      LikeComment,
      LikeStory,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy, CommentsService],
  exports: [UsersService],
})
export class UsersModule {}
