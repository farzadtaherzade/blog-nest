import { Comment } from 'src/posts/entities/comment.entity';
import { Post } from 'src/posts/entities/post.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}

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

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: false, select: false })
  password: string;

  @Column({ nullable: false })
  firstname: string;

  @Column({ nullable: false })
  lastname: string;

  @Column({ nullable: true })
  bio: string;

  @Column('simple-array', { nullable: true })
  permissions: Role[];

  @Column({ nullable: false })
  gender: Gender;

  @OneToMany((type) => Post, (post) => post.author, { nullable: true })
  posts: Post[];

  @OneToMany((type) => Comment, (comment) => comment.user, { nullable: true })
  comments: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
