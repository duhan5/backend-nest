import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { Injectable, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
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
      const { username, password } = loginUserDto;
  
      // 1️⃣ Kullanıcıyı bul
      const user = await this.userRepository.findOneBy({ username });
      if (!user) {
        throw new NotFoundException('Kullanıcı bulunamadı');
      }
  
      // 2️⃣ Şifre kontrolü
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new UnauthorizedException('Şifre yanlış');
      }
  
      // 3️⃣ Opsiyonel: last_login güncellemesi
      // user.last_login = new Date();
      // await this.userRepository.save(user);
  
      // 4️⃣ Cevap
      return {
        message: 'Giriş başarılı',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      };
    }
    // Tüm kullanıcıları getir
    findAll() {
        return this.userRepository.find();
    }
}
