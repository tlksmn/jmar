import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/jusan-user.entity';
import { Repository } from 'typeorm';
import * as request from 'request';
import * as jsdom from 'jsdom';

const { JSDOM } = jsdom;

export interface ProductJusan {
  name: string;
  price: string;
  url: string;
  photoUrl: string;
  amount: string;
  skuJusan: string;
  market: string;
}

@Injectable()
export class JusanScrappingService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  private async newHeadlessBrowser() {
    const browser = await puppeteer.launch({
      headless: false,
      product: 'chrome',
    });
    browser
      .pages()
      .then((pages) => {
        return pages[0].close();
      })
      .then();
    return browser;
  }

  public async isValidLoginPassword(
    login: string,
    password: string,
  ): Promise<boolean> {
    const browser: puppeteer.Browser = await this.newHeadlessBrowser();
    const page = await browser.newPage();
    let currentUser = await this.userRepository.findOneBy({ email: login });
    if (!!!currentUser)
      currentUser = await this.userRepository.save({ email: login, password });

    await page.goto(
      'https://old.jmart.kz/vendor.php?dispatch=auth.login_form&return_url=vendor.php',
    );
    await page.type('#username', login);
    await page.type('#password', password);

    await page.evaluate(() => {
      document.querySelector<HTMLInputElement>('input[type="submit"]').click();
    });
    const userAp = await page.waitForNavigation({ timeout: 60000 });
    const cookies = await page.cookies(`https://old.jmart.kz/`);
    console.log(cookies);
    const headers = userAp.headers();
    console.log('headers', headers);
    if (cookies.length > 1) {
      console.log(cookies);
      currentUser.primaryCookie = cookies.filter(
        (e) => e.name === 'sid_vendor_063ba',
      )[0].value;
      currentUser.secondaryCookie = cookies.filter(
        (e) => e.name === 'BNES_sid_vendor_063ba',
      )[0].value;
      await this.userRepository.save(currentUser);
    }
    return await page.evaluate(
      () =>
        !!!document.querySelector('.alert.cm-notification-content.alert-error'),
    );
    /* sid_vendor_063ba=9fa3dfbe1fba4519c21f23c01e514a2b-A; expires=Wed, 14-Dec-2022 09:28:49 GMT; Max-Age=1209600; path=/; HTTPOnly; Secure; domain=.old.jmart.kz; HttpOnly
     * BNES_sid_vendor_063ba=0hBv53YKq2pjxG7FC7RVcqKC603fsveQe0WH+ORcCZ/ALNJ56bihyMW+cKkF78KWMnUsDllPX4I//ZPJqRD+Z900J13A3yyf6TsSxU01bPGwvIxqXgvjePY9UZhMrCox; expires=Wed, 14-Dec-2022 09:28:49 GMT; Max-Age=1209600; path=/; HTTPOnly; Secure; domain=.old.jmart.kz; HttpOnly
     *
     * _ym_uid=16691151591065988031;
     * _ym_d=1669115159;
     * _tt_enable_cookie=1;
     * _ttp=afa992a5-1cfb-463f-bc31-f06f49afd38e;
     * sid_customer_063ba=5389624eca8ede1fb554d2b3c831617a-C;
     * _ga=GA1.1.1477766441.1669115157;
     * _ga_BC841VM9TH=GS1.1.1669122724.2.0.1669122724.60.0.0;
     * _ga_20MKHW3REZ=GS1.1.1669122724.2.0.1669122724.0.0.0;
     * BNES_sid_customer_063ba=QjO5qgynbYklczjL5bcA3psopYcxEb+xK/cHY+a6y4NCoUrty18+ZIH3J4PaJpnTtILSd+FdC5d0xapmx/yE9yLsWJJ25sxbe/IQmYreCNHwS8fxY6uoZ0YjQx+rkjam;
     * sid_vendor_063ba=9fa3dfbe1fba4519c21f23c01e514a2b-A;
     * BNES_sid_vendor_063ba=0hBv53YKq2pjxG7FC7RVcqKC603fsveQe0WH+ORcCZ/ALNJ56bihyMW+cKkF78KWMnUsDllPX4I//ZPJqRD+Z900J13A3yyf6TsSxU01bPGwvIxqXgvjePY9UZhMrCox
     */
  }

  async getHello(): Promise<ProductJusan[]> {
    const browser: puppeteer.Browser = await this.newHeadlessBrowser();
    const page = await browser.newPage();
    await page.goto(
      'https://old.jmart.kz/vendor.php?dispatch=auth.login_form&return_url=vendor.php',
    );
    await page.type('#username', 'ftimeonline@gmail.com');
    await page.type('#password', '9118812Kz@');
    await page.evaluate(() => {
      document.querySelector<HTMLInputElement>('input[type="submit"]').click();
    });
    await page.waitForNavigation({ timeout: 60000 });

    // console.log(await page.cookies(`https://old.jmart.kz/`));

    await Promise.all([
      page.evaluate(() => {
        document
          .querySelector<HTMLAnchorElement>(
            'a[href="https://old.jmart.kz/vendor.php?dispatch=products.manage"]',
          )
          .click();
      }),
      page.waitForNavigation({ timeout: 60000 }),
    ]);

    await page.type('#amount_from', '1');

    await Promise.all([
      page.evaluate(() => {
        document
          .querySelector<HTMLInputElement>(
            `div.pull-right input[value="Поиск"]`,
          )
          .click();
      }),
      await page.waitForNavigation({ timeout: 60000 }),
    ]);
    await page.evaluate(() => {
      const perPageContainer = document.querySelectorAll<HTMLAnchorElement>(
        `a.cm-ajax.cm-history.pagination-dropdown-per-page`,
      );
      perPageContainer[perPageContainer.length - 1].click();
    });

    await page.waitForFunction(this.checkIsLoaderHidden, { timeout: 60000 });
    let res = await page.evaluate(this.parsePage);
    let currentPage = 2;

    const isAndPage = (): Promise<boolean> => {
      return page.evaluate(
        () =>
          !!!document.querySelector('li.disabled.cm-history.pagination-item'),
      );
    };

    while (await isAndPage()) {
      await this.switchToPage(currentPage, page);
      await page.waitForFunction(this.checkIsLoaderHidden, { timeout: 60000 });
      res = res.concat(await page.evaluate(this.parsePage));
      currentPage++;
    }

    console.log(res.length);
    await browser.close();
    return res;
  }

  private async switchToPage(pageNumber: number, page: puppeteer.Page) {
    await page.evaluate((currentPage) => {
      document
        .querySelector<HTMLAnchorElement>(`a[data-ca-page="${currentPage}"]`)
        .click();
    }, pageNumber);
  }

  private checkIsLoaderHidden = () => {
    return (
      document.querySelector<HTMLDivElement>('div#ajax_loading_box').style
        .display === 'none'
    );
  };

  private parsePage = () => {
    const products: ProductJusan[] = [];
    const tbody = document.querySelector<HTMLTableElement>('tbody');
    const trs = tbody.querySelectorAll<HTMLTableRowElement>('tr');

    trs.forEach((tr) => {
      const tds = tr.querySelectorAll<HTMLTableDataCellElement>('td');

      const name =
        tds[2].querySelector<HTMLAnchorElement>('a.row-status').textContent;
      const price = tds[3].querySelector<HTMLInputElement>('input').value;
      const url = tds[2].querySelector<HTMLAnchorElement>('a').href;
      const photoUrl = tds[1].querySelector<HTMLImageElement>('img').src;
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

  public async getProductList(email: string): Promise<any> {
    const currentUser = await this.userRepository.findOneBy({ email });

    const options = {
      method: 'GET',
      url: 'https://old.jmart.kz/vendor.php?type=simple&pcode_from_q=Y&is_search=Y&dispatch=products.manage&cid=&category_name=%D0%92%D1%81%D0%B5+%D0%BA%D0%B0%D1%82%D0%B5%D0%B3%D0%BE%D1%80%D0%B8%D0%B8&subcats=Y&amount_from=1&free_shipping=&status=&order_ids=&sort_by=list_price&sort_order=desc&period=A&product_type=&product_file%5B0%5D=&parent_product_id=&match=exact&ab__ch1%5Bis_product_filled%5D=ignore&hint_new_view=%D0%9D%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5&page=2&__ncforminfo=pgVltP35sOlwLfK05z1cZg5Ye2RfM7f5JCQ9aIX39qMG9A0N_KsoinrBIW5uX1scT1K1mwYKTtsAKDX6jwgVXLg_N7Btbj4a&result_ids=pagination_contents&is_ajax=1',
      headers: {
        Accept: 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'en-US,en;q=0.9',
        Connection: 'keep-alive',
        Cookie: `_ym_uid=16691151591065988031; 
        _ym_d=1669115159; 
        _tt_enable_cookie=1; 
        _ttp=afa992a5-1cfb-463f-bc31-f06f49afd38e; 
        sid_customer_063ba=5389624eca8ede1fb554d2b3c831617a-C; 
        _ga=GA1.1.1477766441.1669115157; 
        _ga_BC841VM9TH=GS1.1.1669122724.2.0.1669122724.60.0.0; 
        _ga_20MKHW3REZ=GS1.1.1669122724.2.0.1669122724.0.0.0; 
        BNES_sid_customer_063ba=QjO5qgynbYklczjL5bcA3psopYcxEb+xK/cHY+a6y4NCoUrty18+ZIH3J4PaJpnTtILSd+FdC5d0xapmx/yE9yLsWJJ25sxbe/IQmYreCNHwS8fxY6uoZ0YjQx+rkjam; 
        sid_vendor_063ba=02f6596f06e10316a6b4186a3783ee74-A; 
        BNES_sid_vendor_063ba=oMMaET+0eZrjN3ku7haS2vpAdL2mhxeME8F9oNLgbGeam1X1ePv1hmBI1JpPMV193XpTg+CiVlInztR87iLHMgPPhEEpZQg8Y5RHiViEFeUjHRNrF8Wbb/l+3nnlm+G8; 
        BNES_sid_vendor_063ba=${currentUser.secondaryCookie}; 
        sid_vendor_063ba=${currentUser.primaryCookie}`,
        Referer:
          'https://old.jmart.kz/vendor.php?type=simple&pcode_from_q=Y&is_search=Y&dispatch%5Bproducts.manage%5D=%D0%9F%D0%BE%D0%B8%D1%81%D0%BA&cid=&category_name=%D0%92%D1%81%D0%B5+%D0%BA%D0%B0%D1%82%D0%B5%D0%B3%D0%BE%D1%80%D0%B8%D0%B8&subcats=N&subcats=Y&amount_from=1&free_shipping=&status=&order_ids=&sort_by=list_price&sort_order=desc&period=A&product_type=&product_file%5B%5D=&parent_product_id=&match=exact&ab__ch1%5Bis_product_filled%5D=ignore&hint_new_view=%D0%9D%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest',
        'sec-ch-ua':
          '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
      },
    };
    request(options, function (error, response) {
      if (error) throw new Error(error);
      console.log(response.headers);
      const html: string = JSON.parse(response.body).html.pagination_contents;
      const dom = new JSDOM(html);

      console.log(dom.window.document.querySelectorAll('a.row-status').length);
    });
  }
}
