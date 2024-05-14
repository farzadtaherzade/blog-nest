import { Module } from '@nestjs/common';
import { BasketService } from './basket.service';
import { BasketController } from './basket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Basket } from './entities/basket.entity';
import { BasketItem } from './entities/basketItem.entity';
import { Post } from 'src/posts/entities/post.entity';
import { CopyPost } from 'src/posts/entities/copy-post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Basket, BasketItem, Post, CopyPost])],
  controllers: [BasketController],
  providers: [BasketService],
})
export class BasketModule {}
