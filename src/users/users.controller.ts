import { Controller, Post, Body, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserProfileDto } from './dto/user-profile.dto';
@Controller('')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Kayıt olma
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  // Giriş yapma
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return await this.usersService.login(loginUserDto);
  }
  
    // profile info
    @Post('profile')
    async profile(@Body() UserProfileDto: UserProfileDto) {
      return await this.usersService.createProfile(UserProfileDto);
    }
    
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
  
  // Tüm kullanıcıları getir (test amaçlı)

}
