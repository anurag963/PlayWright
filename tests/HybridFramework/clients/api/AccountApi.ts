import { RestClient } from '../../core/RestClient';
import { UserDetailBody } from '../../models/types';
import { UserData } from '../../utils/dataFactory';

/** API 7–14 of https://automationexercise.com/api_list */
export class AccountApi extends RestClient {
  /** Pass a partial object to leave parameters out (negative tests). */
  verifyLogin(credentials: { email?: string; password?: string }) {
    return this.call('POST', '/api/verifyLogin', { form: definedOnly(credentials) });
  }

  /** Unsupported method – expects responseCode 405. */
  deleteToVerifyLogin() {
    return this.call('DELETE', '/api/verifyLogin');
  }

  createAccount(user: UserData) {
    return this.call('POST', '/api/createAccount', { form: toAccountForm(user) });
  }

  updateAccount(user: UserData) {
    return this.call('PUT', '/api/updateAccount', { form: toAccountForm(user) });
  }

  deleteAccount(email: string, password: string) {
    return this.call('DELETE', '/api/deleteAccount', { form: { email, password } });
  }

  /** Omit `email` to send the request without the email parameter. */
  getUserDetailByEmail(email?: string) {
    return this.call<UserDetailBody>('GET', '/api/getUserDetailByEmail', email === undefined ? {} : { params: { email } });
  }
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function toAccountForm(user: UserData): Record<string, string> {
  return {
    name: user.name,
    email: user.email,
    password: user.password,
    title: user.title,
    birth_date: user.birthDay,
    // Test data uses the UI dropdown's month name ("March"); the API wants its number ("3").
    birth_month: String(MONTHS.indexOf(user.birthMonth) + 1),
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
  };
}

function definedOnly(obj: Record<string, string | undefined>): Record<string, string> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Record<string, string>;
}
