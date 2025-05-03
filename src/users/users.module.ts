import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Users } from './entities/user.entity';
import { UserDetail } from './entities/user-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users, UserDetail])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
