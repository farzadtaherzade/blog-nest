import { Tag } from "src/tags/entities/tag.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column({ unique: true })
    slug: string

    @ManyToMany(type => Tag, tag => tag.posts)
    @JoinTable()
    tags: Tag[]

    @Column()
    description: string

    @Column()
    short_description: string

    @Column({ nullable: true })
    cover: string

    @Column({ default: false, nullable: true })
    published: boolean

    @Column({ name: "author_id" })
    authorId: number

    @ManyToOne(type => User, user => user.posts)
    @JoinColumn({ name: 'author_id' })
    author: User

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}
