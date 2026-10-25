import { APIRequestContext, APIResponse } from '@playwright/test';
import * as allure from 'allure-js-commons';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type Multipart = Record<string, string | { name: string; mimeType: string; buffer: Buffer }>;

export interface RequestOptions {
  params?: Record<string, string | number>;
  form?: Record<string, string>;
  multipart?: Multipart;
  headers?: Record<string, string>;
}

const SECRET_FIELDS = /password|card_number|cvc|csrfmiddlewaretoken/i;
const MAX_ATTACHED_BODY = 20_000;

/**
 * Sends every request through one place so each call shows up as an Allure step
 * with its (masked) payload and response attached.
 * Paths are relative; the request context's baseURL comes from playwright.config.ts.
 */
export abstract class BaseClient {
  constructor(protected readonly request: APIRequestContext) {}

  protected async send(method: HttpMethod, path: string, options: RequestOptions = {}): Promise<APIResponse> {
    return allure.step(`${method} ${path}`, async () => {
      const payload = options.form ?? options.multipart;
      if (options.params || payload) {
        await allure.attachment(
          'Request',
          JSON.stringify({ params: options.params, body: payload && mask(payload) }, null, 2),
          'application/json',
        );
      }

      const res = await this.request.fetch(path, { method, ...options });

      const text = await res.text();
      // JSON is always attached (the server labels it text/html); full HTML pages only when short.
      if (looksLikeJson(text)) {
        await allure.attachment(`Response ${res.status()}`, text, 'application/json');
      } else if (text.length < MAX_ATTACHED_BODY) {
        await allure.attachment(`Response ${res.status()}`, text, 'text/plain');
      }
      return res;
    });
  }
}

function mask(body: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(body).map(([k, v]) => [k, SECRET_FIELDS.test(k) ? '***' : typeof v === 'string' ? v : '<file>']),
  );
}

function looksLikeJson(text: string) {
  return /^\s*[{[]/.test(text);
}
