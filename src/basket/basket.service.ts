import { AddItemDto } from './dto/add-item.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Basket } from './entities/basket.entity';
import { BasketItem } from './entities/basketItem.entity';
import { Repository } from 'typeorm';
import { Post, StatusStory } from 'src/posts/entities/post.entity';
import { paginationGen } from 'src/utils/pagination-gen';

@Injectable()
export class BasketService {
  constructor(
    @InjectRepository(Basket)
    private basketRepository: Repository<Basket>,
    @InjectRepository(BasketItem)
    private basketItemsRepository: Repository<BasketItem>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async addToBasket(addItemDto: AddItemDto, user: User) {
    let basket = await this.basketRepository.findOne({
      where: {
        user_id: user.id,
        is_pay: false,
      },
    });

    if (!basket) {
      basket = this.basketRepository.create({
        user_id: user.id,
      });
      await this.basketRepository.save(basket);
    }

    const articleRequested = await this.postsRepository.findOneBy({
      id: addItemDto.article_id,
    });
    if (!articleRequested) throw new NotFoundException('article not found');
    if (articleRequested.status != StatusStory.ForSale)
      throw new BadRequestException('this article is not for sell');
    const item = this.basketItemsRepository.create({
      article_id: articleRequested.id,
      basket_id: basket.id,
    });
    this.basketItemsRepository.save(item);
    return {
      data: {
        message: 'article added to basket',
      },
    };
  }

  async findOne(user: User, page: number = 1) {
    const limit = 10;
    page = page == 0 ? 1 : page;
    const skip = limit * (page - 1);

    let basket = await this.basketRepository.findOne({
      where: {
        user_id: user.id,
        is_pay: false,
      },
      relations: {
        user: true,
      },
    });
    if (!basket) {
      basket = this.basketRepository.create({
        user_id: user.id,
      });
      await this.basketRepository.save(basket);
    }

    const [items, count] = await this.basketItemsRepository.findAndCount({
      where: {
        basket_id: basket.id,
      },
      relations: {
        article: true,
      },
      skip,
      take: limit,
    });
    return {
      data: {
        basket,
        items,
      },
      pagination: paginationGen(count, limit, page),
    };
  }

  async remove(id: number) {
    return `This action removes a #${id} basket`;
  }
}
