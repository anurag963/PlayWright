import { env } from '../utils/env';
import { csrfToken } from '../utils/htmlParser';
import { BaseClient, Multipart, RequestOptions } from './BaseClient';

export interface HtmlPage {
  status: number;
  /** Final URL after redirects, e.g. /payment_done/500 after paying. */
  url: string;
  html: string;
}

/**
 * Base for the storefront's server-rendered endpoints (cart, login, checkout, contact)
 * that have no JSON API. Session cookies live in the test's request context, so each
 * test gets its own cart and login.
 */
export abstract class WebClient extends BaseClient {
  protected async getPage(path: string, options?: RequestOptions): Promise<HtmlPage> {
    const res = await this.send('GET', path, options);
    return { status: res.status(), url: res.url(), html: await res.text() };
  }

  /**
   * Loads `formPage` for a fresh CSRF token, then posts `fields` to `action`.
   * Django also checks the Referer on HTTPS, so it is set to the form page.
   */
  protected async submitForm(
    formPage: string,
    action: string,
    fields: Record<string, string>,
    files?: Multipart,
  ): Promise<HtmlPage> {
    const token = csrfToken((await this.getPage(formPage)).html);
    const body = { csrfmiddlewaretoken: token, ...fields };
    const res = await this.send('POST', action, {
      headers: { Referer: `${env.baseUrl}${formPage}` },
      ...(files ? { multipart: { ...body, ...files } } : { form: body }),
    });
    return { status: res.status(), url: res.url(), html: await res.text() };
  }
}
