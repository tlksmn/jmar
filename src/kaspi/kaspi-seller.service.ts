import { Injectable } from '@nestjs/common';
import { Seller } from './entities/seller.enitity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class KaspiSellerService {
  constructor(@InjectRepository(Seller) sellerRepository: Repository<Seller>) {}
}
