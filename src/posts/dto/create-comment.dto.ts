import { Comment } from './../entities/comment.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Post } from 'src/posts/entities/post.entity';
import { User } from 'src/users/entities/user.entity';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  message: string;

  @IsOptional()
  @ApiProperty({ required: false, type: Number })
  parentId: number;

  parent: Comment;

  post: Post;
  user: User;
}
