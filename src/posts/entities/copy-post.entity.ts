/* eslint-disable @typescript-eslint/no-unused-vars */
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './post.entity';

@Entity()
export class CopyPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'article_id' })
  article_id: number;

  @Column({ name: 'buyer_id' })
  buyer_id: number;

  @ManyToOne((type) => User, (user) => user.articles_buy)
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @ManyToOne((type) => Post, (post) => post.copied)
  @JoinColumn({ name: 'article_id' })
  articles: Post;
}
