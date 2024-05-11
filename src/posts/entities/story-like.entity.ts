import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Post } from './post.entity';

@Entity()
export class LikeStory {
  @PrimaryGeneratedColumn()
  number: number;

  @Column({ name: 'target_id' })
  target_id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @ManyToOne((_type) => Post, (post) => post.likes)
  @JoinColumn({ name: 'target_id' })
  target: Post;

  @ManyToOne((_type) => User, (user) => user.story_likes)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
