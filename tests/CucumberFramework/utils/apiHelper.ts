import { APIRequestContext } from '@playwright/test';
import { env } from './env';
import { UserData } from './dataFactory';

/**
 * Thin wrapper over the site's public API (https://automationexercise.com/api_list).
 * Used for fast test setup/teardown so UI tests only exercise what they verify.
 * Note: the API always returns HTTP 200; the real status is in body.responseCode.
 */
export class ApiHelper {
  private readonly baseUrl = env.baseUrl.replace(/\/$/, '');

  constructor(private readonly request: APIRequestContext) {}

  async createAccount(user: UserData): Promise<void> {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const res = await this.request.post(`${this.baseUrl}/api/createAccount`, {
      form: {
        name: user.name,
        email: user.email,
        password: user.password,
        title: user.title,
        birth_date: user.birthDay,
        birth_month: String(months.indexOf(user.birthMonth) + 1),
        birth_year: user.birthYear,
        firstname: user.firstName,
        lastname: user.lastName,
        company: user.company,
        address1: user.address1,
        address2: user.address2,
        country: user.country,
        zipcode: user.zipcode,
        state: user.state,
        city: user.city,
        mobile_number: user.mobileNumber,
      },
    });
    const body = await res.json();
    if (body.responseCode !== 201) {
      throw new Error(`createAccount failed for ${user.email}: ${JSON.stringify(body)}`);
    }
  }

  async userExists(email: string, password: string): Promise<boolean> {
    const res = await this.request.post(`${this.baseUrl}/api/verifyLogin`, { form: { email, password } });
    return (await res.json()).responseCode === 200;
  }

  /** Best-effort cleanup; ignores "not found" so it is safe after UI deletion. */
  async deleteAccount(email: string, password: string): Promise<void> {
    await this.request.delete(`${this.baseUrl}/api/deleteAccount`, { form: { email, password } });
  }
}
