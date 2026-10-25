import { DataTable } from 'playwright-bdd';
import { When, Then, expect, currentUser, currentUserData } from '../fixtures/apiFixtures';
import { userDetailSchema } from '../models/schemas';
import { createUser, uniqueEmail, UserData } from '../utils/dataFactory';

/** Field names allowed in "I update the user's account with:" tables. */
const UPDATABLE_FIELDS: (keyof UserData)[] = [
  'name', 'title', 'firstName', 'lastName', 'company', 'address1', 'address2',
  'country', 'state', 'city', 'zipcode', 'mobileNumber',
];

// ---------- Create / delete / update ----------

When("I create the user's account", async ({ ctx, accountApi }) => {
  ctx.response = await accountApi.createAccount(currentUserData(ctx));
});

When("I try to create an account with the user's email", async ({ ctx, accountApi }) => {
  const user = currentUser(ctx);
  ctx.response = await accountApi.createAccount(createUser({ name: user.name, email: user.email }));
});

When("I delete the user's account", async ({ ctx, accountApi }) => {
  const user = currentUser(ctx);
  ctx.response = await accountApi.deleteAccount(user.email, user.password);
});

When("I update the user's account with:", async ({ ctx, accountApi }, table: DataTable) => {
  const changes = table.rowsHash() as Partial<Record<keyof UserData, string>>;
  const unknown = Object.keys(changes).filter((k) => !UPDATABLE_FIELDS.includes(k as keyof UserData));
  if (unknown.length) throw new Error(`Unknown field(s) ${unknown.join(', ')}. Use: ${UPDATABLE_FIELDS.join(', ')}`);

  const updated = { ...currentUserData(ctx), ...changes } as UserData;
  ctx.response = await accountApi.updateAccount(updated);
  // Later steps (details, checkout address) compare against the updated data.
  ctx.userData = updated;
});

// ---------- Verify login ----------

When("I verify the login with the user's credentials", async ({ ctx, accountApi }) => {
  const { email, password } = currentUser(ctx);
  ctx.response = await accountApi.verifyLogin({ email, password });
});

When('I verify the login with an unknown email', async ({ ctx, accountApi }) => {
  ctx.response = await accountApi.verifyLogin({ email: uniqueEmail('wrong'), password: 'WrongPassword!1' });
});

When("I verify the login with the user's email and a wrong password", async ({ ctx, accountApi }) => {
  ctx.response = await accountApi.verifyLogin({ email: currentUser(ctx).email, password: 'WrongPassword!1' });
});

When('I verify the login without an email', async ({ ctx, accountApi }) => {
  ctx.response = await accountApi.verifyLogin({ password: 'AnyPassword!1' });
});

// ---------- User details ----------

When("I fetch the user's details by email", async ({ ctx, accountApi }) => {
  ctx.response = await accountApi.getUserDetailByEmail(currentUser(ctx).email);
});

When('I fetch user details for an unknown email', async ({ ctx, accountApi }) => {
  ctx.response = await accountApi.getUserDetailByEmail(uniqueEmail('missing'));
});

When('I fetch user details without an email', async ({ ctx, accountApi }) => {
  ctx.response = await accountApi.getUserDetailByEmail();
});

Then('the user details match the user', async ({ ctx }) => {
  const user = currentUserData(ctx);
  const details = ctx.response?.body.user;
  expect(details).toMatchObject(userDetailSchema);
  expect(details).toMatchObject({
    name: user.name,
    email: user.email,
    title: user.title,
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

// ---------- Storefront login / logout ----------

When('I log in to the site with an unknown email', async ({ ctx, auth }) => {
  ctx.login = await auth.login(uniqueEmail('wrong'), 'WrongPassword!1');
});

Then('the login fails with {string}', async ({ ctx }, message: string) => {
  expect(ctx.login?.loggedInAs).toBeNull();
  expect(ctx.login?.text).toContain(message);
});

Then('I am on the login page', async ({ ctx }) => {
  expect(new URL(ctx.page?.url ?? '').pathname).toBe('/login');
});
