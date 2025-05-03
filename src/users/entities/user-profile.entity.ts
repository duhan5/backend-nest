// src/user-details/entities/user-detail.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Users } from '../../users/entities/user.entity';

@Entity('user_details')
export class UserDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @Column()
  full_name: string;

  @Column({nullable: true})
  address: string;

  @Column({nullable: true})
  phone: string;

  @Column({nullable: true})
  identity_number: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ default: true })
  is_active: boolean;
}
