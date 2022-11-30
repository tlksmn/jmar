import { Module } from '@nestjs/common';
import { KaspiSellerService } from './kaspi-seller.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seller } from './entities/seller.enitity';

@Module({
  imports: [TypeOrmModule.forFeature([Seller])],
  providers: [KaspiSellerService],
})
export class KaspiModule {}
