import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  //   IsStrongPassword,
} from 'class-validator';
import { Gender } from '../entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @ApiProperty()
  //   @IsStrongPassword()
  password: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  username: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  firstname: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  lastname: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  @ApiProperty()
  gender: Gender
}
