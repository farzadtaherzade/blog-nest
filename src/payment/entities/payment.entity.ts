/* eslint-disable @typescript-eslint/no-unused-vars */
import { Basket } from 'src/basket/entities/basket.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column()
  amount: number;

  @Column()
  desciprion: string;

  @Column({ nullable: true })
  message: string;

  @Column({ default: false })
  verify: boolean;

  @Column({ nullable: true })
  transId: number;

  @Column()
  factorNumber: string;

  @Column({ width: 50 })
  paymentDate: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ name: 'basket_id' })
  basket_id: number;

  @ManyToOne((type) => User, (user) => user.payments)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne((type) => Basket, (basket) => basket.payment)
  @JoinColumn({ name: 'basket_id' })
  basket: User;
}
