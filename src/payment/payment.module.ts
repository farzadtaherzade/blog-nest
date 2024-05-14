import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Basket } from 'src/basket/entities/basket.entity';
import { BasketItem } from 'src/basket/entities/basketItem.entity';
import { Payment } from './entities/payment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CopyPost } from 'src/posts/entities/copy-post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Basket, BasketItem, Payment, CopyPost])],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
