import { JusanApiService } from './jusan-api.service';
import { RequestService } from '../jusan/tools/request/request.service';
import { Test, TestingModule } from '@nestjs/testing';

class RequestServiceMock {
  public async handle(data): Promise<any> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({});
      }, 1000);
    });
  }
}

describe('jusan api-response', () => {
  let jusanApiService: JusanApiService;
  let requestService: RequestService;

  beforeAll(async () => {
    const RequestServiceMockContainer = {
      provide: RequestService,
      useValue: RequestServiceMock,
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [JusanApiService, RequestServiceMockContainer],
    }).compile();

    jusanApiService = module.get<JusanApiService>(JusanApiService);
    requestService = module.get<RequestService>(RequestService);
  });

  describe('testng continuis integration', () => {
    it('is jusan api service defined ', () => {
      expect(jusanApiService).toBeDefined();
    });
    it('is jusan api service defined ', () => {
      expect(requestService).toBeDefined();
    });
    it('is', async () => {
      const temp = await requestService.handle({});
      expect(requestService.handle).toHaveBeenCalled();
      expect(temp).toBeTruthy();
    });
  });
});
