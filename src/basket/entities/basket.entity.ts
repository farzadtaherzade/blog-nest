/* eslint-disable @typescript-eslint/no-unused-vars */
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BasketItem } from './basketItem.entity';

@Entity()
export class Basket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @OneToOne((_type) => User, (user) => user.basket, { onDelete: 'CASCADE' })
  @JoinTable({ name: 'user_id' })
  user: User;

  @OneToMany((_type) => BasketItem, (item) => item.basket, {
    onDelete: 'SET NULL',
  })
  articles: BasketItem[];
}
