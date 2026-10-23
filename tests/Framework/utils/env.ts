import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env'), quiet: true });

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env variable "${key}". Copy tests/Framework/.env.example to .env and fill it in.`);
  }
  return value;
}

export const env = {
  baseUrl: process.env.BASE_URL ?? 'https://www.automationexercise.com',
  user: {
    name: required('USER_NAME'),
    email: required('USER_EMAIL'),
    password: required('USER_PASSWORD'),
  },
};
