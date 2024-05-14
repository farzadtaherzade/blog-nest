/* eslint-disable @typescript-eslint/no-unused-vars */
import { Comment } from 'src/posts/entities/comment.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LikeStory } from './story-like.entity';
import { BasketItem } from 'src/basket/entities/basketItem.entity';
import { CopyPost } from './copy-post.entity';

export enum StatusStory {
  Draft = 'draft',
  Published = 'published',
  ForSale = 'for_sale',
}

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  description: string;

  @Column()
  short_description: string;

  @Column({ nullable: true, default: false })
  special: boolean;

  @Column({ nullable: true })
  cover: string;

  @Column({ nullable: true, default: '' })
  time_to_read: string;

  @Column({ default: StatusStory.Draft, nullable: true })
  status: StatusStory;

  @Column({ nullable: true, default: 120000 })
  price: number;

  @Column({ name: 'author_id' })
  authorId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany((type) => Tag, (tag) => tag.posts)
  @JoinTable()
  tags: Tag[];

  @ManyToOne((type) => User, (user) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @OneToMany((type) => Comment, (comment) => comment.post, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  comments: Comment[];

  @OneToMany((_type) => LikeStory, (like) => like.target, {
    onDelete: 'CASCADE',
  })
  likes: LikeStory[] | number;

  @OneToMany((_type) => BasketItem, (item) => item.article, {
    onDelete: 'CASCADE',
  })
  basketItem: BasketItem[];
  @OneToMany((_type) => CopyPost, (copy_post) => copy_post.articles, {
    onDelete: 'CASCADE',
  })
  copied: CopyPost[];
}
