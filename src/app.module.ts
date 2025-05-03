import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './users/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserDetail } from './users/entities/user-profile.entity';

@Module({
  imports: [
    // ENV dosyasını global olarak projeye tanıtıyoruz
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // TypeORM ile veritabanına bağlanıyoruz
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // ConfigModule'den env verilerini çekmek için
      inject: [ConfigService], // ConfigService kullanılacak
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT', '5432')),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [Users, UserDetail],
        synchronize: true,
      }),
    }),

    // Users module burada ekli (kullanıcı işlemleri)
    UsersModule,

    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
