import { InjectRepository } from '@nestjs/typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(Post)
        private postsRepository: Repository<Post>,
        @InjectRepository(Comment)
        private commentsRepository: Repository<Comment>
    ) { }

    async create(createCommentDto: CreateCommentDto, id: number) {
        const post = await this.postsRepository.findOne({
            where: {
                id
            },
        })
        if (!post) throw new NotFoundException("post not found")
        createCommentDto.post = post
        const comment = this.commentsRepository.create(createCommentDto)
        const savecomment = await this.commentsRepository.save(comment)
        return savecomment;
    }

    async findAll(id: number, page: number = 1) {
        const perPage = 5
        const skip = perPage * (page - 1)
        const commentCheck = await this.commentsRepository.find({
            where: {
                postId: id,
                post: {
                    published: true
                }
            },
            select: {
                id: true
            }
        })
        const comments = await this.commentsRepository.find({
            where: {
                postId: id,
                post: {
                    published: true
                }
            },
            relations: {
                user: true
            },
            take: perPage,
            skip,
        })

        const total = commentCheck.length
        const lastPage = Math.ceil(total / perPage)
        return {
            data: {
                comments
            },
            paginate: {
                currentPage: +page,
                perPage,
                total,
                lastPage
            },
        }
    }

    async remove(id: number, user: User) {
        const comment = await this.commentsRepository.findOne({
            where: {
                id,
                userId: user.id
            }
        })
        await this.commentsRepository.remove(comment)
        return "comment deleted successfully"
    }
}