import { CreateUserDto } from './dto/create-user.dto';
import { Injectable } from '@nestjs/common';
import { Role, User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}
  async createUser(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create({
      ...createUserDto,
      permissions: [Role.User],
    });
    const newUser = await this.usersRepository.save(user);
    return newUser;
  }

  async uploadAvatar(file: Express.Multer.File, id: number) {
    const user = await this.usersRepository.findOne({
      where: {
        id: id,
      },
    });

    if (user.avatar) {
      const filePath = path.join('uploads', user.avatar);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log('File deleted successfully');
      });
    }
    user.avatar = file.filename;
    await this.usersRepository.save(user);
    return user;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: {
        email,
      },
      select: {
        password: true,
      },
    });
    return user;
  }
}
