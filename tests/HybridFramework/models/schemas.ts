import { expect } from '@playwright/test';

/**
 * Contract shapes for `toMatchObject`. They fail on a missing field or a wrong type,
 * but allow extra fields so additive API changes do not break the suite.
 */
export const productSchema = {
  id: expect.any(Number),
  name: expect.any(String),
  price: expect.stringMatching(/^Rs\. \d+$/),
  brand: expect.any(String),
  category: {
    usertype: { usertype: expect.stringMatching(/^(Women|Men|Kids)$/) },
    category: expect.any(String),
  },
};

export const brandSchema = {
  id: expect.any(Number),
  brand: expect.any(String),
};

export const userDetailSchema = {
  id: expect.any(Number),
  name: expect.any(String),
  email: expect.any(String),
  title: expect.any(String),
  birth_day: expect.any(String),
  birth_month: expect.any(String),
  birth_year: expect.any(String),
  first_name: expect.any(String),
  last_name: expect.any(String),
  company: expect.any(String),
  address1: expect.any(String),
  address2: expect.any(String),
  country: expect.any(String),
  state: expect.any(String),
  city: expect.any(String),
  zipcode: expect.any(String),
};
