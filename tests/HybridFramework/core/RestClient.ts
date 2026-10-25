import { ApiBody } from '../models/types';
import { BaseClient, HttpMethod, RequestOptions } from './BaseClient';

export interface ApiResult<T extends ApiBody = ApiBody> {
  httpStatus: number;
  body: T;
}

/**
 * Base for the JSON endpoints under /api.
 * The server labels JSON as text/html, so the body is parsed from text.
 */
export abstract class RestClient extends BaseClient {
  protected async call<T extends ApiBody = ApiBody>(
    method: HttpMethod,
    path: string,
    options?: RequestOptions,
  ): Promise<ApiResult<T>> {
    const res = await this.send(method, path, options);
    const text = await res.text();
    try {
      return { httpStatus: res.status(), body: JSON.parse(text) as T };
    } catch {
      throw new Error(`${method} ${path} did not return JSON (HTTP ${res.status()}): ${text.slice(0, 200)}`);
    }
  }
}
