import { Post } from "src/posts/entities/post.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Comment {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false })
    message: string

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @Column({ name: "userId" })
    userId: number

    @Column({ name: "post_id" })
    postId: number

    @ManyToOne(type => User, user => user.comments)
    @JoinColumn({ name: 'userId' })
    user: User

    @ManyToOne(type => Post, post => post.comments, { nullable: false })
    @JoinColumn({ name: 'post_id' })
    post: Post
}
