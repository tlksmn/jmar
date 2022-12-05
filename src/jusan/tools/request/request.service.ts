import { Injectable } from '@nestjs/common';
import * as request from 'request';

@Injectable()
export class RequestService {
  public async handle(data): Promise<any> {
    return new Promise((resolve, reject) => {
      request(data, function (err, response) {
        if (err) {
          reject(err);
        }
        resolve(response as any);
      });
    });
  }
}
