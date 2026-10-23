import { expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { AccountStatusPage } from '../pages/AccountStatusPage';
import { HeaderComponent } from '../components/HeaderComponent';
import { CheckoutPage } from '../pages/CheckoutPage';
import { UserData } from './dataFactory';

/**
 * Reusable multi-page business flows, built only from page objects.
 * Keeps specs short when the same journey appears in several test cases.
 */
export async function registerUserViaUi(
  loginPage: LoginPage,
  signupPage: SignupPage,
  accountStatusPage: AccountStatusPage,
  user: UserData,
) {
  await expect(loginPage.signupHeading).toBeVisible();
  await loginPage.startSignup(user.name, user.email);
  await expect(signupPage.accountInfoHeading).toBeVisible();
  await signupPage.completeRegistration(user);
  await expect(accountStatusPage.accountCreated).toHaveText('Account Created!', { ignoreCase: true });
  await accountStatusPage.continue();
  await expect(loggedInText(signupPage.header, user.name)).toBeVisible();
}

export async function deleteAccountViaUi(header: HeaderComponent, accountStatusPage: AccountStatusPage) {
  await header.deleteAccount();
  await expect(accountStatusPage.accountDeleted).toHaveText('Account Deleted!', { ignoreCase: true });
  await accountStatusPage.continue();
}

export function loggedInText(header: HeaderComponent, name: string) {
  return header.loggedInAs.filter({ hasText: `Logged in as ${name}` });
}

/** Verifies an address block on the checkout page matches the registered user. */
export async function expectAddressMatches(checkoutPage: CheckoutPage, which: 'delivery' | 'billing', user: UserData) {
  const block = which === 'delivery' ? checkoutPage.deliveryAddress : checkoutPage.billingAddress;
  await expect(block.locator('.address_firstname')).toHaveText(`${user.title}. ${user.firstName} ${user.lastName}`);
  await expect(block).toContainText(user.company);
  await expect(block).toContainText(user.address1);
  await expect(block).toContainText(user.address2);
  await expect(block.locator('.address_city')).toHaveText(`${user.city} ${user.state} ${user.zipcode}`);
  await expect(block.locator('.address_country_name')).toHaveText(user.country);
  await expect(block.locator('.address_phone')).toHaveText(user.mobileNumber);
}
