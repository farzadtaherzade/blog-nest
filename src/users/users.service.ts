import { ChangeUsernameDto, CreateUserDto } from './dto/user.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';
import { Follow } from './entities/follow.entity';
import { Profile } from './entities/profile.entity';
import { generateRandomString } from 'src/helper/generate';
import { UpdateProfileDto } from './dto/update-user.dto';
import { paginationGen } from 'src/utils/pagination-gen';
import { Post, StatusStory } from 'src/posts/entities/post.entity';
import { CommentsService } from 'src/posts/comments.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(Post)
    private storyRepository: Repository<Post>,
    private readonly commentService: CommentsService,
  ) {}
  async createUser(createUserDto: CreateUserDto) {
    const user = await this.usersRepository.create({
      username: createUserDto.username,
      email: createUserDto.email,
      password: createUserDto.password,
      permissions: [Role.User],
    });
    const newUser = await this.usersRepository.save(user);
    const profile = new Profile();
    profile.nick_name = createUserDto.username + '-' + generateRandomString(5);
    profile.user_id = newUser.id;
    await this.profileRepository.save(profile);
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

  async getMe(user: User) {
    const profile = await this.profileRepository.findOne({
      where: {
        user_id: user.id,
      },
      relations: {
        user: true,
      },
    });
    console.log(user);
    console.log(profile);
    return profile;
  }

  async getUser(username: string, user: User) {
    const target = await this.findUserByUsername(username);
    const isFollow =
      target.id == user.id
        ? false
        : await this.followRepository.exists({
            where: {
              user_id: user.id,
              target_id: target.id,
            },
          });
    return {
      data: {
        ...target,
        follow: isFollow,
      },
    };
  }

  async getFollowrs(username: string, page: number) {
    const limit = 15;
    const skip = limit * (page - 1);
    const user = await this.findUserByUsername(username);
    const [followers, count] = await this.followRepository.findAndCount({
      where: {
        target_id: user.id,
      },
      take: limit,
      skip: +skip,
    });
    return {
      data: {
        followers,
      },
      pagination: paginationGen(count, limit, +page),
    };
  }

  async getUserStories(username: string, user: User, page: number) {
    const limit = 15;
    const skip = limit * (page - 1);
    const author = await this.findUserByUsername(username);
    const where =
      user.id == author.id
        ? { authorId: author.id }
        : {
            authorId: author.id,
            status: StatusStory.Published,
          };
    const [stories, count] = await this.storyRepository.findAndCount({
      where,
      skip,
      take: limit,
    });

    for (let i = 0; i < stories.length; i++) {
      stories[i]['commentsCount'] =
        await this.commentService.countCommentByPostId(stories[i].id);
    }

    return {
      data: {
        stories,
      },
      pagination: paginationGen(count, limit, +page),
    };
  }

  async checkUsername(username: string): Promise<boolean> {
    return await this.usersRepository.existsBy({
      username,
    });
  }

  async changeUsername(user: User, usernameDto: ChangeUsernameDto) {
    const { username } = usernameDto;
    const checkUsername = await this.usersRepository.existsBy({
      username,
    });
    if (checkUsername) throw new BadRequestException('username already use');
    user.username = username;
    await this.usersRepository.save(user);
    return 'username changed';
  }
  async getFollowing(username: string, page: number) {
    const limit = 15;
    const skip = limit * (page - 1);
    const user = await this.findUserByUsername(username);
    console.log(page);
    const [followers, count] = await this.followRepository.findAndCount({
      where: {
        user_id: user.id,
      },
      take: limit,
      skip: +skip,
    });
    return {
      data: {
        followers,
      },
      pagination: paginationGen(count, limit, +page),
    };
  }

  async updateProfile(updateDto: UpdateProfileDto, user: User) {
    const profile = await this.profileRepository.findOneBy({
      user_id: user.id,
    });
    const { nick_name, firstname, lastname, bio, gender } = updateDto;
    if (nick_name) profile.nick_name = nick_name;
    if (firstname) profile.firstname = firstname;
    if (lastname) profile.lastname = lastname;
    if (bio) profile.bio = bio;
    if (gender) profile.gender = gender;
    await this.profileRepository.save(profile);
  }

  async uploadAvatar(file: Express.Multer.File, profileId: number) {
    const profile = await this.profileRepository.findOne({
      where: {
        id: profileId,
      },
      relations: {
        user: true,
      },
    });

    if (profile.avatar) {
      const filePath = path.join('uploads', profile.avatar);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log('File deleted successfully');
      });
    }
    profile.avatar = file.filename;
    await this.usersRepository.save(profile);
    return {
      data: {
        profile,
      },
      message: 'Profile Updated Succssfully',
    };
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
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
