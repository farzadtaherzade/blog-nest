import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePostDto } from './create-post.dto';

// export class UpdatePostDto {
//   @IsString()
//   @IsNotEmpty()
//   @Length(10, 250)
//   @ApiProperty()
//   title: string;

//   @IsString()
//   @IsNotEmpty()
//   @Length(10, 2500)
//   @ApiProperty()
//   description: string;

//   @IsString()
//   @IsNotEmpty()
//   @Length(10, 150)
//   @ApiProperty()
//   short_description: string;

//   @IsString()
//   @IsNotEmpty()
//   @Length(10, 50)
//   @ApiProperty()
//   slug: string;

//   @IsString()
//   @IsNotEmpty()
//   @ApiProperty()
//   time_to_read: string;

//   @IsNotEmpty()
//   @ApiProperty({ type: [Number] })
//   tagsId: number[];
// }

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  slug: string;
}
