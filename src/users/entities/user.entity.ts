import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other'
}

export enum Role {
  Admin = 'admin',
  User = 'user',
  Author = 'author'
}

@Entity("user")
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 30, unique: true, nullable: false })
  username: string

  @Column({ length: 60, unique: true, nullable: false })
  email: string

  @Column({ nullable: true })
  profile_image: string;

  @Column()
  password: string

  @Column()
  firstname: string

  @Column()
  lastname: string

  @Column({ nullable: true })
  bio: string;

  @Column('simple-array', { nullable: true })
  permissions: Role[]

  @Column({})
  gender: Gender
}
