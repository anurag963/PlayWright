import { RestClient } from '../../core/RestClient';
import { ProductsBody } from '../../models/types';

/** API 1, 2, 5, 6 of https://automationexercise.com/api_list */
export class ProductsApi extends RestClient {
  getAllProducts() {
    return this.call<ProductsBody>('GET', '/api/productsList');
  }

  /** Unsupported method – expects responseCode 405. */
  postToProductsList() {
    return this.call('POST', '/api/productsList');
  }

  /** Omit `term` to send the request without the search_product parameter. */
  searchProduct(term?: string) {
    return this.call<ProductsBody>('POST', '/api/searchProduct', term === undefined ? {} : { form: { search_product: term } });
  }
}
