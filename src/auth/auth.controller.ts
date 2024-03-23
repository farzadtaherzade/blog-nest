import { Body, Controller, Get, HttpCode, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { SigninDto } from './dto/signin.dto';
import { Response } from 'express';
import { ApiConsumes } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/signup')
  @ApiConsumes("application/x-www-form-urlencoded", "application/json")
  @HttpCode(200)
  async signup(@Body() registerDto: CreateUserDto): Promise<User> {
    return await this.authService.signup(registerDto);
  }

  @Post('/signin')
  @ApiConsumes("application/x-www-form-urlencoded", "application/json")
  @HttpCode(200)
  async signin(
    @Body() signinDto: SigninDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<string> {
    const token = await this.authService.signin(signinDto);
    const date = new Date();
    date.setDate(date.getDate() + 10);
    response.cookie('Authorization', token, { expires: date });
    return 'login was successfully.';
  }

  @Get('/signout')
  @HttpCode(200)
  async signout(
    @Res({ passthrough: true }) response: Response,
  ): Promise<string> {
    response.cookie('Authorization', '', { expires: new Date() });
    return 'your are signout.';
  }
}
