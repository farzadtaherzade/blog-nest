/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Column,
  Entity,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Basket } from './basket.entity';
import { Post } from 'src/posts/entities/post.entity';

@Entity()
export class BasketItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'article_id' })
  article_id: number;

  @Column({ name: 'basket_id' })
  basket_id: number;

  @ManyToOne((_type) => Basket, (basket) => basket.articles)
  @JoinTable({ name: 'user_id' })
  basket: Basket;

  @ManyToOne((_type) => Post, (article) => article.basketItem)
  @JoinTable({ name: 'article_id' })
  article: Post;
}
