import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  //   IsStrongPassword,
} from 'class-validator';
import { Gender } from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  //   @IsStrongPassword()
  password: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  firstname: string;

  @IsNotEmpty()
  @IsString()
  lastname: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender
}
