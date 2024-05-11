import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comment } from './comment.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class LikeComment {
  @PrimaryGeneratedColumn()
  number: number;

  @Column({ name: 'target_id' })
  target_id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @ManyToOne((type) => Comment, (comment) => comment.likes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'target_id' })
  target: Comment;

  @ManyToOne((type) => User, (user) => user.comment_likes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
