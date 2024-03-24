import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { Post } from "src/posts/entities/post.entity";
import { User } from "src/users/entities/user.entity";

export class CreateCommentDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    message: string

    post: Post
    user: User
}
