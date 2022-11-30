import { Module } from '@nestjs/common';
import { JuanScrappingController } from './jusan-scrapping.contoller';
import { JusanScrappingService } from './jusan-scrapping.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/jusan-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [JuanScrappingController],
  providers: [JusanScrappingService],
})
export class JusanScrappingModule {}
