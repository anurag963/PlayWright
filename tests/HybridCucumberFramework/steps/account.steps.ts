import { DataTable } from 'playwright-bdd';
import { When, Then, expect, currentUser, currentUserData } from '../fixtures/hybridFixtures';
import { UserData } from '../utils/dataFactory';
import { deleteAccountViaUi, expectAddressMatches, registerUserViaUi } from '../utils/flows';

/** Field names allowed in "I update the user's account via the API with:" tables. */
const UPDATABLE_FIELDS: (keyof UserData)[] = [
  'name', 'title', 'firstName', 'lastName', 'company', 'address1', 'address2',
  'country', 'state', 'city', 'zipcode', 'mobileNumber',
];

// ---------- UI ----------

When('I register the user through the UI', async ({ ctx, homePage, loginPage, signupPage, accountStatusPage }) => {
  await homePage.open();
  await homePage.header.goToSignupLogin();
  await registerUserViaUi(loginPage, signupPage, accountStatusPage, currentUserData(ctx));
});

When('I delete the account in the UI', async ({ homePage, accountStatusPage }) => {
  await deleteAccountViaUi(homePage.header, accountStatusPage);
});

Then('the UI {word} address matches the user', async ({ ctx, checkoutPage }, block: string) => {
  if (block !== 'delivery' && block !== 'billing') throw new Error(`Address block must be "delivery" or "billing", got "${block}".`);
  await expectAddressMatches(checkoutPage, block, currentUserData(ctx));
});

// ---------- API ----------

When("I update the user's account via the API with:", async ({ ctx, accountApi }, table: DataTable) => {
  const changes = table.rowsHash() as Partial<Record<keyof UserData, string>>;
  const unknown = Object.keys(changes).filter((k) => !UPDATABLE_FIELDS.includes(k as keyof UserData));
  if (unknown.length) throw new Error(`Unknown field(s) ${unknown.join(', ')}. Use: ${UPDATABLE_FIELDS.join(', ')}`);

  const updated = { ...currentUserData(ctx), ...changes } as UserData;
  expect(await accountApi.updateAccount(updated)).toHaveResponseCode(200, 'User updated!');
  // Later UI checks (checkout address) compare against the updated data.
  ctx.userData = updated;
});

Then('the API confirms the user exists', async ({ ctx, accountApi }) => {
  const { email, password } = currentUser(ctx);
  expect(await accountApi.verifyLogin({ email, password })).toHaveResponseCode(200, 'User exists!');
});

Then('the API reports the user does not exist', async ({ ctx, accountApi }) => {
  const { email, password } = currentUser(ctx);
  expect(await accountApi.verifyLogin({ email, password })).toHaveResponseCode(404, 'User not found!');
  expect(await accountApi.getUserDetailByEmail(email)).toHaveResponseCode(404);
});

Then('the API user details match what was entered in the UI', async ({ ctx, accountApi }) => {
  const user = currentUserData(ctx);
  const res = await accountApi.getUserDetailByEmail(user.email);
  expect(res).toHaveResponseCode(200);
  expect(res.body.user).toMatchObject({
    name: user.name,
    email: user.email,
    title: user.title,
    birth_day: user.birthDay,
    birth_year: user.birthYear,
    first_name: user.firstName,
    last_name: user.lastName,
    company: user.company,
    address1: user.address1,
    address2: user.address2,
    country: user.country,
    state: user.state,
    city: user.city,
    zipcode: user.zipcode,
  });
});
