import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { UserData } from '../utils/dataFactory';

/** /signup – "Enter Account Information" form shown after the initial signup step. */
export class SignupPage extends BasePage {
  protected readonly path = '/signup';

  readonly accountInfoHeading: Locator;
  readonly password: Locator;
  readonly days: Locator;
  readonly months: Locator;
  readonly years: Locator;
  readonly newsletter: Locator;
  readonly optin: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly company: Locator;
  readonly address1: Locator;
  readonly address2: Locator;
  readonly country: Locator;
  readonly state: Locator;
  readonly city: Locator;
  readonly zipcode: Locator;
  readonly mobileNumber: Locator;
  readonly createAccountButton: Locator;

  constructor(page: Page) {
    super(page);
    this.accountInfoHeading = page.locator('h2', { hasText: 'Enter Account Information' });
    this.password = page.locator('[data-qa="password"]');
    this.days = page.locator('[data-qa="days"]');
    this.months = page.locator('[data-qa="months"]');
    this.years = page.locator('[data-qa="years"]');
    this.newsletter = page.locator('#newsletter');
    this.optin = page.locator('#optin');
    this.firstName = page.locator('[data-qa="first_name"]');
    this.lastName = page.locator('[data-qa="last_name"]');
    this.company = page.locator('[data-qa="company"]');
    this.address1 = page.locator('[data-qa="address"]');
    this.address2 = page.locator('[data-qa="address2"]');
    this.country = page.locator('[data-qa="country"]');
    this.state = page.locator('[data-qa="state"]');
    this.city = page.locator('[data-qa="city"]');
    this.zipcode = page.locator('[data-qa="zipcode"]');
    this.mobileNumber = page.locator('[data-qa="mobile_number"]');
    this.createAccountButton = page.locator('[data-qa="create-account"]');
  }

  async fillAccountInformation(user: UserData) {
    await this.page.locator(user.title === 'Mr' ? '#id_gender1' : '#id_gender2').check();
    await this.password.fill(user.password);
    await this.days.selectOption(user.birthDay);
    await this.months.selectOption({ label: user.birthMonth });
    await this.years.selectOption(user.birthYear);
    await this.newsletter.check();
    await this.optin.check();
  }

  async fillAddressInformation(user: UserData) {
    await this.firstName.fill(user.firstName);
    await this.lastName.fill(user.lastName);
    await this.company.fill(user.company);
    await this.address1.fill(user.address1);
    await this.address2.fill(user.address2);
    await this.country.selectOption(user.country);
    await this.state.fill(user.state);
    await this.city.fill(user.city);
    await this.zipcode.fill(user.zipcode);
    await this.mobileNumber.fill(user.mobileNumber);
  }

  async completeRegistration(user: UserData) {
    await this.fillAccountInformation(user);
    await this.fillAddressInformation(user);
    await this.createAccountButton.click();
  }
}
