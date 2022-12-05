import { Module } from '@nestjs/common';
import { RequestService } from './request.service';

@Module({
  imports: [],
  exports: [RequestService],
  providers: [RequestService],
})
export class RequestModule {}
