import { Tag } from "src/tags/entities/tag.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true, length: 125 })
    title: string

    @Column({ unique: true })
    slug: string

    @ManyToMany(type => Tag, tag => tag.posts)
    tags: Tag[]

    @Column()
    description: string

    @Column()
    cover: string

    @Column({ default: false })
    published: boolean

    @ManyToOne(type => User, user => user.posts)
    author: User

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}
