import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import {
  PayOption,
  PayResponse,
  PayVerifyResponse,
} from './types/pay.interface';
import { Basket } from 'src/basket/entities/basket.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BasketItem } from 'src/basket/entities/basketItem.entity';
import * as moment from 'moment-jalali';
import { Payment } from './entities/payment.entity';
import axios from 'axios';
import { factorNumberGenerator } from 'src/utils/functions';
import fetch from 'node-fetch';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Basket)
    private basketRepository: Repository<Basket>,
    @InjectRepository(BasketItem)
    private itemsRepository: Repository<BasketItem>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}
  async payment(user: User) {
    const url = 'https://pay.ir/pg/send ';
    const basket = await this.basketRepository.findOne({
      where: {
        user_id: user.id,
        is_pay: false,
      },
    });
    if (!basket) {
      const newBasket = this.basketRepository.create({
        user_id: user.id,
      });
      await this.basketRepository.save(newBasket);
      throw new BadRequestException('your basket is empty!');
    }
    const basketItems = await this.itemsRepository.existsBy({
      basket_id: basket.id,
    });
    if (!basketItems) throw new BadRequestException('your basket is empty!');
    const [{ amount }] = await this.itemsRepository.query(
      'select SUM(price) as amount from basket_item as bi left join post on bi.article_id=post.id',
    );
    if (amount <= 0 || amount == undefined || amount == null)
      throw new BadRequestException('no article available to buy');

    const factorNumber = factorNumberGenerator();
    const pay_options: PayOption = {
      api: 'test',
      amount,
      description: 'buy an article',
      redirect: 'http://localhost:4000/payment/verify',
      factorNumber,
    };

    // send options to pay
    const { data } = await axios.post(url, pay_options);
    const { status, token }: PayResponse = data;

    if (status == 1 && token) {
      const paymentModel = this.paymentRepository.create({
        user_id: user.id,
        basket_id: basket.id,
        paymentDate: moment().format('jYYYYjMMjDDHHmmss'),
        verify: false,
        token: token,
        amount: amount,
        desciprion: pay_options.description,
        factorNumber,
      });
      await this.paymentRepository.save(paymentModel);
      basket.payment_id = paymentModel.id;
      await this.basketRepository.save(basket);
      return {
        data: {
          status,
          url: `https://pay.ir/pg/${token}`,
        },
      };
    }
    throw new BadRequestException('recived parameters are not valid');
  }

  async verify(status: number, token: string) {
    if (status == 0 || !token)
      throw new BadRequestException('you payment is not valid');
    const url = 'https://pay.ir/pg/verify';
    const payment = await this.paymentRepository.findOneBy({
      token,
      verify: false,
    });

    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.verify) throw new BadRequestException('You Already pay');
    const basket = await this.basketRepository.findOneBy({
      payment_id: payment.id,
    });

    // verify body to string json
    const verifyBody = JSON.stringify({
      api: 'test',
      token,
    });

    const verifyResult: PayVerifyResponse = await (
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: verifyBody,
      })
    ).json();
    if (verifyResult.status == 1) {
      payment.transId = verifyResult.transId;
      payment.message = verifyResult.message;
      payment.verify = true;
      basket.is_pay = true;
      this.paymentRepository.save(payment);
      this.basketRepository.save(basket);
      return {
        data: {
          message: 'your payment successfully pay',
        },
      };
    }
    throw new BadRequestException('your payment not pay');
  }
}
