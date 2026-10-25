import { request } from '@playwright/test';
import { env } from './utils/env';

/** Fails fast if the .env credentials are wrong, before any test runs. */
export default async function globalSetup() {
  const ctx = await request.newContext({ baseURL: env.baseUrl });
  try {
    const res = await ctx.post('/api/verifyLogin', { form: { email: env.user.email, password: env.user.password } });
    if ((await res.json()).responseCode !== 200) {
      throw new Error(
        `Login for USER_EMAIL=${env.user.email} failed. Check USER_EMAIL / USER_PASSWORD in tests/ApiFramework/.env`,
      );
    }
  } finally {
    await ctx.dispose();
  }
}
