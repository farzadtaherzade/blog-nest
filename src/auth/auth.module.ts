import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from 'src/users/users.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Follow } from 'src/users/entities/follow.entity';
import { Profile } from 'src/users/entities/profile.entity';
import { Post } from 'src/posts/entities/post.entity';
import { Comment } from 'src/posts/entities/comment.entity';
import { CommentsService } from 'src/posts/comments.service';
import { LikeComment } from 'src/posts/entities/comment-like.entity';
import { LikeStory } from 'src/posts/entities/story-like.entity';
import { CopyPost } from 'src/posts/entities/copy-post.entity';

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
      CopyPost,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('SECRET'),
        signOptions: {
          expiresIn: '10d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, JwtStrategy, CommentsService],
})
export class AuthModule {}
