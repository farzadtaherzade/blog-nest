import { Post } from "src/posts/entities/post.entity";
import { Column, CreateDateColumn, Entity, Index, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Tag {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true })
    @Index({ fulltext: true })
    name: string

    @ManyToMany(type => Post, post => post.tags)
    posts: Post[]

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}
