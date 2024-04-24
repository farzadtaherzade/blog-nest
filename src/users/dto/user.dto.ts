import {
  IsEmail,
  IsNotEmpty,
  IsString,
  //   IsStrongPassword,
} from 'class-validator';
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
}

export class ChangeUsernameDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  username: string;
}
