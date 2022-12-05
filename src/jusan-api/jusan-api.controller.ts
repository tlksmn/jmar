import { Controller, Get } from '@nestjs/common';
import { JusanApiService } from './jusan-api.service';

@Controller()
export class JusanApiController {
  constructor(private readonly jusanApiService: JusanApiService) {}

  @Get()
  index() {
    return this.jusanApiService.getProductList({
      login: 'ftimeonline@gmail.com',
      password: '9118812Kz@',
    });
  }
}
