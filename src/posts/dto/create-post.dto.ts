import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString, ArrayMinSize, ArrayMaxSize } from "class-validator";
import { Tag } from "src/tags/entities/tag.entity";
import { User } from "src/users/entities/user.entity";

export class CreatePostDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    title: string

    author: User

    slug: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    description: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    short_description: string

    @IsNotEmpty()
    @ApiProperty({ required: true, minLength: 2, maxLength: 7, type: [Number] })
    tagsId: number[]
}
