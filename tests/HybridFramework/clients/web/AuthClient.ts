import { WebClient } from '../../core/WebClient';
import { loggedInAs, pageText } from '../../utils/htmlParser';

export interface LoginResult {
  /** Name shown in "Logged in as …", or null when login failed. */
  loggedInAs: string | null;
  url: string;
  text: string;
}

/** Session login/logout via the /login form (the REST API only verifies credentials). */
export class AuthClient extends WebClient {
  async login(email: string, password: string): Promise<LoginResult> {
    const page = await this.submitForm('/login', '/login', { email, password });
    return { loggedInAs: loggedInAs(page.html), url: page.url, text: pageText(page.html) };
  }

  async logout() {
    return this.getPage('/logout');
  }

  async currentUser(): Promise<string | null> {
    return loggedInAs((await this.getPage('/')).html);
  }
}
