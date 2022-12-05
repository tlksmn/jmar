import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { JusanScrappingModule } from './jusan/jusan-scrapping.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { JusanApiModule } from './jusan-api/jusan-api.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    // JusanScrappingModule,
    JusanApiModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        logging: false,
        dropSchema: false,
        entities: ['dist/**/*.entity.js'],
        synchronize: true,
        autoLoadEntities: true,
        namingStrategy: new SnakeNamingStrategy(),
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
