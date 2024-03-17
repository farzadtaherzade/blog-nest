import { CreateUserDto } from './dto/create-user.dto';
import { Injectable } from '@nestjs/common';
import { Role, User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }
  async createUser(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create({ ...createUserDto, permissions: [Role.User] });
    const newUser = await this.usersRepository.save(user)
    return newUser;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: {
        email
      }
    });
    return user;
  }
}
