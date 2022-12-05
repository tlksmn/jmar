import { Module } from '@nestjs/common';
import { JusanApiService } from './jusan-api.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../jusan/entities/jusan-user.entity';
import { JusanApiController } from './jusan-api.controller';
import { HttpModule } from '@nestjs/axios';
import { RequestModule } from '../jusan/tools/request/request.module';
import { RequestService } from '../jusan/tools/request/request.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), RequestModule],
  providers: [JusanApiService, RequestService],
  controllers: [JusanApiController],
})
export class JusanApiModule {}
