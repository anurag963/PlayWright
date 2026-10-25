import { RestClient } from '../../core/RestClient';
import { BrandsBody } from '../../models/types';

/** API 3, 4 of https://automationexercise.com/api_list */
export class BrandsApi extends RestClient {
  getAllBrands() {
    return this.call<BrandsBody>('GET', '/api/brandsList');
  }

  /** Unsupported method – expects responseCode 405. */
  putToBrandsList() {
    return this.call('PUT', '/api/brandsList');
  }
}
