import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { StatusStory } from '../entities/post.entity';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @Length(10, 250)
  @ApiProperty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 2500)
  @ApiProperty()
  description: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 150)
  @ApiProperty()
  short_description: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  time_to_read: string;

  @IsEnum(StatusStory)
  @IsNotEmpty()
  @ApiProperty({
    required: false,
    default: StatusStory.Draft,
    enum: StatusStory,
  })
  status: StatusStory;

  @IsNotEmpty()
  @ApiProperty({ required: true, minLength: 2, maxLength: 7, type: [Number] })
  tagsId: string | number[];
}
