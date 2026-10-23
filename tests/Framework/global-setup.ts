import { request } from '@playwright/test';
import { env } from './utils/env';
import { ApiHelper } from './utils/apiHelper';

/** Fails fast if the .env credentials are wrong, before any UI test runs. */
export default async function globalSetup() {
  const ctx = await request.newContext();
  try {
    const api = new ApiHelper(ctx);
    if (!(await api.userExists(env.user.email, env.user.password))) {
      throw new Error(
        `Login for USER_EMAIL=${env.user.email} failed. Check USER_EMAIL / USER_PASSWORD in tests/Framework/.env`,
      );
    }
  } finally {
    await ctx.dispose();
  }
}
