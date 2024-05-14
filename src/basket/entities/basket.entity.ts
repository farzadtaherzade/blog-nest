/* eslint-disable @typescript-eslint/no-unused-vars */
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BasketItem } from './basketItem.entity';
import { Payment } from 'src/payment/entities/payment.entity';

@Entity()
export class Basket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ name: 'payment_id', nullable: true, select: false })
  payment_id: number;

  @Column({ default: false })
  is_pay: boolean;

  @ManyToOne((_type) => User, (user) => user.basket, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany((_type) => BasketItem, (item) => item.basket, {
    onDelete: 'SET NULL',
  })
  articles: BasketItem[];

  @OneToOne((type) => Payment, (payment) => payment.basket)
  payment: Payment;
}
