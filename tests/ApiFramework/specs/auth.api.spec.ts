import { test, expect } from '../fixtures/apiFixtures';
import { userDetailSchema } from '../models/schemas';
import { createUser, uniqueEmail } from '../utils/dataFactory';

test.describe('Authentication API', () => {
  test('TC1: Register User', async ({ accountApi, newUser }) => {
    expect(await accountApi.createAccount(newUser)).toHaveResponseCode(201, 'User created!');
    expect(await accountApi.verifyLogin(newUser)).toHaveResponseCode(200, 'User exists!');

    const details = await accountApi.getUserDetailByEmail(newUser.email);
    expect(details).toHaveResponseCode(200);
    expect(details.body.user).toMatchObject(userDetailSchema);
    expect(details.body.user).toMatchObject({
      name: newUser.name,
      email: newUser.email,
      title: newUser.title,
      first_name: newUser.firstName,
      last_name: newUser.lastName,
    });

    expect(await accountApi.deleteAccount(newUser.email, newUser.password)).toHaveResponseCode(200, 'Account deleted!');
    expect(await accountApi.verifyLogin(newUser)).toHaveResponseCode(404, 'User not found!');
  });

  test('TC2: Login User with correct email and password', async ({ accountApi, auth, envUser }) => {
    expect(await accountApi.verifyLogin(envUser)).toHaveResponseCode(200, 'User exists!');

    // The .env user is shared by other tests, so it is logged out rather than deleted.
    const login = await auth.login(envUser.email, envUser.password);
    expect(login.loggedInAs).toBe(envUser.name);
    await auth.logout();
  });

  test('TC2b: Login and delete a throwaway user', async ({ accountApi, auth, apiUser }) => {
    const login = await auth.login(apiUser.email, apiUser.password);
    expect(login.loggedInAs).toBe(apiUser.name);

    expect(await accountApi.deleteAccount(apiUser.email, apiUser.password)).toHaveResponseCode(200, 'Account deleted!');
    expect(await accountApi.verifyLogin(apiUser)).toHaveResponseCode(404, 'User not found!');
  });

  test('TC3: Login User with incorrect email and password', async ({ accountApi, auth }) => {
    const email = uniqueEmail('wrong');
    expect(await accountApi.verifyLogin({ email, password: 'WrongPassword!1' })).toHaveResponseCode(404, 'User not found!');

    const login = await auth.login(email, 'WrongPassword!1');
    expect(login.loggedInAs).toBeNull();
    expect(login.text).toContain('Your email or password is incorrect!');
  });

  test('TC3: Login with correct email and wrong password', async ({ accountApi, envUser }) => {
    expect(await accountApi.verifyLogin({ email: envUser.email, password: 'WrongPassword!1' })).toHaveResponseCode(
      404,
      'User not found!',
    );
  });

  test('TC3: Verify login without email parameter', async ({ accountApi, envUser }) => {
    expect(await accountApi.verifyLogin({ password: envUser.password })).toHaveResponseCode(
      400,
      'Bad request, email or password parameter is missing in POST request.',
    );
  });

  test('TC3: DELETE to verify login is not supported', async ({ accountApi }) => {
    expect(await accountApi.deleteToVerifyLogin()).toHaveResponseCode(405, 'This request method is not supported.');
  });

  test('TC4: Logout User', async ({ auth, envUser }) => {
    expect((await auth.login(envUser.email, envUser.password)).loggedInAs).toBe(envUser.name);

    const page = await auth.logout();
    expect(new URL(page.url).pathname).toBe('/login');
    expect(await auth.currentUser()).toBeNull();
  });

  test('TC5: Register User with existing email', async ({ accountApi, envUser }) => {
    const duplicate = createUser({ name: envUser.name, email: envUser.email });
    expect(await accountApi.createAccount(duplicate)).toHaveResponseCode(400, 'Email already exists!');
  });

  test('Update user account', async ({ accountApi, apiUser }) => {
    const updated = { ...apiUser, company: 'Updated Labs', city: 'Mysore', address1: '10 Downing Street' };
    expect(await accountApi.updateAccount(updated)).toHaveResponseCode(200, 'User updated!');

    const { body } = await accountApi.getUserDetailByEmail(apiUser.email);
    expect(body.user).toMatchObject({ company: 'Updated Labs', city: 'Mysore', address1: '10 Downing Street' });
  });

  test('Get user detail for unknown email', async ({ accountApi }) => {
    expect(await accountApi.getUserDetailByEmail(uniqueEmail('missing'))).toHaveResponseCode(
      404,
      'Account not found with this email, try another email!',
    );
  });

  test('Get user detail without email parameter', async ({ accountApi }) => {
    expect(await accountApi.getUserDetailByEmail()).toHaveResponseCode(
      400,
      'Bad request, email parameter is missing in GET request.',
    );
  });
});
