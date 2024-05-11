import { Post } from 'src/posts/entities/post.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LikeComment } from './comment-like.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  message: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ name: 'parent_id', nullable: true })
  parent_id: number;

  @Column({ name: 'post_id' })
  postId: number;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => User, (user) => user.comments)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => Comment, (comment) => comment.parent, {
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Comment;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToMany((_type) => Comment, (comment) => comment.replies, {
    nullable: true,
  })
  replies: Comment[] | number;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => Post, (post) => post.comments, { nullable: false })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @OneToMany((_type) => LikeComment, (like) => like.target, {
    onDelete: 'CASCADE',
  })
  likes: LikeComment[];
}
