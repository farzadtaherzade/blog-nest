import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Gender } from '../entities/profile.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: 'Baba Yaga' })
  nick_name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: 'John!' })
  firstname: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: 'Wick' })
  lastname: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: 'tell us about yourself.' })
  bio: string;

  @IsOptional()
  @IsEnum(Gender)
  @ApiProperty({ enum: Gender, required: false })
  gender: Gender;
}
