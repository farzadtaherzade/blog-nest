import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Follow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ name: 'target_id' })
  target_id: number;

  @ManyToOne((type) => User, (user) => user.following)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne((type) => User, (user) => user.followers)
  @JoinColumn({ name: 'target_id' })
  target: User;

  @CreateDateColumn()
  followdAt: Date;
}
