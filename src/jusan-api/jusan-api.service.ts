import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../jusan/entities/jusan-user.entity';
import { Repository } from 'typeorm';
import * as jsdom from 'jsdom';
import { ProductJusan } from '../jusan/jusan-scrapping.service';
import { RequestService } from '../jusan/tools/request/request.service';
const { JSDOM } = jsdom;

type LoginT = {
  password: string;
  login: string;
};

@Injectable()
export class JusanApiService {
  constructor(
    // @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly requestService: RequestService,
  ) {}
  async getProductList({ password, login }: LoginT) {
    const options = {
      method: 'POST',
      url: 'https://old.jmart.kz/vendor.php',
      headers: {
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'max-age=0',
        Connection: 'keep-alive',
        'Content-Type': 'application/x-www-form-urlencoded',
        Origin: 'https://old.jmart.kz',
        Referer:
          'https://old.jmart.kz/vendor.php?dispatch=auth.login_form&return_url=vendor.php',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        'sec-ch-ua':
          '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
      },
      form: {
        return_url: 'vendor.php',
        user_login: login,
        password,
        'dispatch[auth.login]': 'Войти',
      },
    };
    const response = await this.requestService
      .handle(options)
      .then((response) => {
        const headersArray = response.toJSON().headers['set-cookie'];
        const sid_vendor_063ba = headersArray[0].split(';')[0].split('=')[1];
        const BNES_sid_vendor_063ba = headersArray
          .filter((e) => e.includes('BNES_sid_vendor_063ba'))[0]
          .split(';')[0]
          .split('=')[1];

        const options = {
          method: 'GET',
          url: 'https://old.jmart.kz/vendor.php?type=simple&pcode_from_q=Y&is_search=Y&cid=&category_name=%D0%92%D1%81%D0%B5+%D0%BA%D0%B0%D1%82%D0%B5%D0%B3%D0%BE%D1%80%D0%B8%D0%B8&subcats=Y&amount_from=0&free_shipping=&status=&order_ids=&sort_by=list_price&sort_order=desc&period=A&product_type=&product_file%5B0%5D=&parent_product_id=&match=exact&ab__ch1%5Bis_product_filled%5D=ignore&hint_new_view=%D0%9D%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5&dispatch=products.manage&page=2&__ncforminfo=iinQZ_8kKB1rIivwdvnFThpuc7WJRHBat12PMuMaV328JyrMFa4XteILM90DV-vZb5UR_XKFxOPwaQ3Tw8TUfyWmNXteWBJC&result_ids=pagination_contents&is_ajax=1&items_per_page=5000',
          headers: {
            Accept: 'application/json, text/javascript, */*; q=0.01',
            'Accept-Language': 'en-US,en;q=0.9',
            Connection: 'keep-alive',
            Referer:
              'https://old.jmart.kz/vendor.php?type=simple&pcode_from_q=Y&is_search=Y&cid=&category_name=%D0%92%D1%81%D0%B5+%D0%BA%D0%B0%D1%82%D0%B5%D0%B3%D0%BE%D1%80%D0%B8%D0%B8&subcats=N&subcats=Y&amount_from=0&free_shipping=&status=&order_ids=&sort_by=list_price&sort_order=desc&period=A&product_type=&product_file%5B%5D=&parent_product_id=&match=exact&ab__ch1%5Bis_product_filled%5D=ignore&hint_new_view=%D0%9D%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5&dispatch%5Bproducts.manage%5D=%D0%9F%D0%BE%D0%B8%D1%81%D0%BA',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
            'X-Requested-With': 'XMLHttpRequest',
            'sec-ch-ua':
              '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            Cookie: `BNES_sid_vendor_063ba=${BNES_sid_vendor_063ba}; sid_vendor_063ba=${sid_vendor_063ba};`,
          },
        };
        return options;
      })
      .then((options) => {
        return this.requestService.handle(options);
      })
      .then((response) => JSON.parse(response.body))
      .then((data) => {
        try {
          const html = data.html.pagination_contents;
          const dom = new JSDOM(html);
          return this.parsePage(dom.window.document);
        } catch (e) {
          throw new HttpException(
            {
              message: 'Password or login are incorrect',
            },
            HttpStatus.FORBIDDEN,
          );
        }
      });
    return response;
  }
  private parsePage = (document: HTMLDocument) => {
    const products: ProductJusan[] = [];
    const tbody = document.querySelector<HTMLTableElement>('tbody');
    const trs = tbody.querySelectorAll<HTMLTableRowElement>('tr');

    trs.forEach((tr) => {
      const tds = tr.querySelectorAll<HTMLTableDataCellElement>('td');

      const name =
        tds[2].querySelector<HTMLAnchorElement>('a.row-status').textContent;
      const price = tds[3].querySelector<HTMLInputElement>('input').value;
      const url = tds[2].querySelector<HTMLAnchorElement>('a').href;
      const photoUrl = tds[1].querySelector<HTMLImageElement>('img')?.src || '';
      const amount = tds[5].querySelector<HTMLInputElement>('input').value;
      const skuJusan = tds[2].querySelector<HTMLSpanElement>(
        '.product-code__label',
      ).textContent;
      const market = tds[2].querySelector<HTMLElement>('small').textContent;

      products.push({
        name,
        price,
        url,
        photoUrl,
        amount,
        skuJusan,
        market,
      });
    });
    return products;
  };
}
