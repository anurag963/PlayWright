import path from 'path';
import { test, expect } from '../fixtures/apiFixtures';
import { uniqueEmail } from '../utils/dataFactory';

const contactForm = () => ({
  name: 'PW Tester',
  email: uniqueEmail('contact'),
  subject: 'Automation feedback',
  message: 'This message was sent by the Playwright API framework.',
  filePath: path.resolve(__dirname, '../testData/upload.txt'),
});

test.describe('Contact and pages API', () => {
  // The success banner is client-side JS, so over HTTP we verify the multipart POST is accepted.
  test('TC6: Contact Us Form', async ({ site }) => {
    const res = await site.submitContactForm(contactForm());

    expect(res.status).toBe(200);
    expect(res.text).toContain('Get In Touch');
  });

  test('TC6: Contact Us Form without CSRF token is rejected', async ({ site }) => {
    expect((await site.submitContactFormWithoutCsrf(contactForm())).status).toBe(403);
  });

  test('TC7: Verify Test Cases Page', async ({ site }) => {
    const page = await site.open('/test_cases');

    expect(page.status).toBe(200);
    expect(page.html).toContain('<title>Automation Practice Website for UI Testing - Test Cases</title>');
    expect(page.text).toContain('Test Case 1: Register User');
  });

  test('API list page is reachable', async ({ site }) => {
    const page = await site.open('/api_list');

    expect(page.status).toBe(200);
    expect(page.text).toContain('API 1: Get All Products List');
  });
});
