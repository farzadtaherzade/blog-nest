/* eslint-disable @typescript-eslint/no-unused-vars */
import { Comment } from 'src/posts/entities/comment.entity';
import { Post } from 'src/posts/entities/post.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Follow } from './follow.entity';
import { Profile } from './profile.entity';
import { LikeComment } from 'src/posts/entities/comment-like.entity';
import { LikeStory } from 'src/posts/entities/story-like.entity';
import { Basket } from 'src/basket/entities/basket.entity';

export enum Role {
  Admin = 'admin',
  User = 'user',
  Author = 'author',
}

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30, unique: true, nullable: false })
  username: string;

  @Column({ length: 60, unique: true, nullable: false })
  email: string;

  @Column({ nullable: false, select: false })
  password: string;

  @Column('simple-array', { nullable: true })
  permissions: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne((type) => Profile, (profile) => profile.user, {
    onDelete: 'CASCADE',
  })
  profile: Profile;

  @OneToOne((type) => Basket, (basket) => basket.user, {
    onDelete: 'CASCADE',
  })
  basket: Basket;

  @OneToMany((type) => Post, (post) => post.author, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  posts: Post[];

  @OneToMany((type) => Comment, (comment) => comment.user, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  comments: Comment[];

  @OneToMany((type) => Follow, (follow) => follow.target, {
    onDelete: 'CASCADE',
  })
  followers: Follow[];

  @OneToMany((type) => Follow, (follow) => follow.user, { onDelete: 'CASCADE' })
  following: Follow[];

  @OneToMany((type) => LikeComment, (like) => like.user, {
    onDelete: 'CASCADE',
  })
  comment_likes: LikeComment[];

  @OneToMany((type) => LikeComment, (like) => like.user, {
    onDelete: 'CASCADE',
  })
  story_likes: LikeStory[];
}
