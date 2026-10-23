export interface UserData {
  title: 'Mr' | 'Mrs';
  name: string;
  email: string;
  password: string;
  birthDay: string;
  birthMonth: string; // month name as shown in the dropdown, e.g. "March"
  birthYear: string;
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  mobileNumber: string;
}

export interface CardData {
  nameOnCard: string;
  cardNumber: string;
  cvc: string;
  expiryMonth: string;
  expiryYear: string;
}

const uid = () => `${Date.now()}${Math.floor(Math.random() * 10_000)}`;

/** Builds a unique, throwaway user for registration flows. */
export function createUser(overrides: Partial<UserData> = {}): UserData {
  const id = uid();
  return {
    title: 'Mr',
    name: `PW User ${id}`,
    email: `pw.user.${id}@example.com`,
    password: `Pass@${id}`,
    birthDay: '15',
    birthMonth: 'March',
    birthYear: '1995',
    firstName: 'Test',
    lastName: `User${id}`,
    company: 'QA Labs',
    address1: '221B Baker Street',
    address2: 'Near Central Park',
    country: 'India',
    state: 'Karnataka',
    city: 'Bangalore',
    zipcode: '560001',
    mobileNumber: '9876543210',
    ...overrides,
  };
}

export function createCard(overrides: Partial<CardData> = {}): CardData {
  return {
    nameOnCard: 'Test User',
    cardNumber: '4111111111111111',
    cvc: '123',
    expiryMonth: '12',
    expiryYear: '2030',
    ...overrides,
  };
}

export function uniqueEmail(prefix = 'pw'): string {
  return `${prefix}.${uid()}@example.com`;
}
