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

  @Column({ name: 'taget_id' })
  target_id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @ManyToOne((type) => Comment, (comment) => comment.likes)
  @JoinColumn({ name: 'taget_id' })
  target: Comment;

  @ManyToOne((type) => User, (comment) => comment.commentLikes)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
