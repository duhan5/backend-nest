import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserDetail } from './entities/user-profile.entity';
import { UserProfileDto } from './dto/user-profile.dto';
import { Injectable, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,

    @InjectRepository(UserDetail)
    private userProfileRepository: Repository<UserDetail>, // EKLEDİK
) {}

  // Kullanıcı oluşturma
  async create(createUserDto: CreateUserDto) {
    const { username, email, password } = createUserDto;

    // 1️⃣ E-posta çakışmasını kontrol et
    const emailExists = await this.userRepository.findOneBy({ email });
    if (emailExists) {
      throw new ConflictException('Bu e-posta zaten kayıtlı');
    }

    // 2️⃣ Kullanıcı adı çakışmasını kontrol et
    const usernameExists = await this.userRepository.findOneBy({ username });
    if (usernameExists) {
      throw new ConflictException('Bu kullanıcı adı zaten alınmış');
    }

    // 3️⃣ Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Yeni kullanıcıyı oluştur ve kaydet
    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      created_at: new Date(),
      // last_login: boş bırakın, default null olur
    });
    await this.userRepository.save(user);

    // 5️⃣ Cevap olarak sadece gerekli alanları döndür
    return {
      message: 'Kullanıcı başarıyla oluşturuldu',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  }
  

    // Kullanıcı giriş
    async login(loginUserDto: LoginUserDto) {
      const { identifier, password } = loginUserDto;
    
      // Kullanıcıyı username veya email ile bulmaya çalış
      const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.username = :identifier', { identifier })
      .orWhere('user.email = :identifier', { identifier })
      .getOne();
    
      if (!user) {
        throw new NotFoundException('Kullanıcı bulunamadı');
      }
    
      // Şifre kontrolü
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new UnauthorizedException('Şifre yanlış');
      }
    
      // last_login güncelle
      user.last_login = new Date();
      await this.userRepository.save(user);
    
      // Cevap
      return {
        message: 'Giriş başarılı',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      };
    }

    async createProfile(userProfileDto: UserProfileDto) {
      const userId = 1; // ÖRNEK (ileride req.user.id olacak)
  
      // Daha önce profil var mı?
      const existingProfile = await this.userProfileRepository.findOneBy({ user_id: userId });
  
      if (existingProfile) {
          // Güncelle
          this.userProfileRepository.merge(existingProfile, userProfileDto);
          const updatedProfile = await this.userProfileRepository.save(existingProfile);
  
          return {
              message: 'Profil güncellendi',
              profile: updatedProfile,
          };
      }
  
      // Yoksa yeni oluştur
      const userProfile = this.userProfileRepository.create({
          user_id: userId,
          ...userProfileDto,
      });
  
      await this.userProfileRepository.save(userProfile);
  
      return {
          message: 'Profil oluşturuldu',
          profile: userProfile,
      };
  }
  
    
    // Tüm kullanıcıları getir
    findAll() {
        return this.userRepository.find();
    }
}
