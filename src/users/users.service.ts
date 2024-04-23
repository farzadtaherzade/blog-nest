import { CreateUserDto } from './dto/create-user.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Role, User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';
import { Follow } from './entities/follow.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
  ) {}
  async createUser(createUserDto: CreateUserDto) {
    const user = await this.usersRepository.create({
      ...createUserDto,
      permissions: [Role.User],
    });
    const newUser = await this.usersRepository.save(user);
    return newUser;
  }

  async followToggle(username: string, user: User) {
    const target = await this.findUserByUsername(username);
    if (target.id == user.id)
      return { data: { message: `${username} you cant follow yourself` } };
    const follower = await this.followRepository.findOne({
      where: {
        user_id: user.id,
        target_id: target.id,
      },
    });
    if (!follower) {
      const follow = this.followRepository.create({
        user: user,
        target: target,
      });
      this.followRepository.save(follow);
      return {
        data: {
          message: `${username} followd`,
        },
      };
    }
    this.followRepository.remove(follower);

    return {
      data: {
        message: `${username} unfollow`,
      },
    };
  }

  async getUser(username: string, user: User) {
    const target = await this.findUserByUsername(username);
    const isFollow = await this.followRepository.exists({
      where: {
        user_id: user.id,
        target_id: target.id,
      },
    });
    console.log(target);
    return {
      data: {
        ...target,
        follow: isFollow,
      },
    };
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

  async findUserByUsername(username: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: {
        username,
      },
      select: {
        password: false,
      },
    });
    if (!user) throw new NotFoundException('profile not found');
    return user;
  }
}
