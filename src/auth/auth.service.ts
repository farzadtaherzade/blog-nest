import { CreateUserDto } from 'src/users/dto/user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { SigninDto } from './dto/signin.dto';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  async signup(signupDto: CreateUserDto) {
    const user = await this.usersService.findUserByEmail(signupDto.email);
    if (user) throw new BadRequestException('username or email already used');
    const salt = bcrypt.genSaltSync(10);
    const hashPass = bcrypt.hashSync(signupDto.password, salt);
    signupDto.password = hashPass;
    return await this.usersService.createUser(signupDto);
  }
  async signin(signinDto: SigninDto) {
    const user = await this.usersService.findUserByEmail(signinDto.email);
    if (!user)
      throw new BadRequestException('email or password is wrong try again');
    const comparePass = bcrypt.compareSync(signinDto.password, user.password);
    if (!comparePass)
      throw new UnauthorizedException('email or password is wrong try again');
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);
    return accessToken;
  }
}
