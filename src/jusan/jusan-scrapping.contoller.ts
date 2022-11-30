import { Body, Controller, Get, Query } from '@nestjs/common';
import { JusanScrappingService, ProductJusan } from './jusan-scrapping.service';

@Controller()
export class JuanScrappingController {
  constructor(private readonly jusanScrappingService: JusanScrappingService) {}

  @Get()
  getHello(): Promise<ProductJusan[]> {
    return this.jusanScrappingService.getHello();
  }

  @Get('a')
  isTruther(@Query() query) {
    return this.jusanScrappingService.isValidLoginPassword(
      query.login,
      query.password,
    );
  }

  @Get('b')
  userProductList(@Query() query) {
    return this.jusanScrappingService.getProductList(query.email);
  }
}
