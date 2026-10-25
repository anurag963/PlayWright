import { CartRow, CheckoutAddress } from '../models/types';

/**
 * Minimal extractors for the storefront's server-rendered HTML.
 * The markup is stable and simple, so targeted regexes avoid an HTML-parser dependency.
 */

const ENTITIES: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&#x27;': "'" };

function clean(text: string): string {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/&(amp|lt|gt|quot|#39|#x27);/g, (e) => ENTITIES[e])
    .replace(/\s+/g, ' ')
    .trim();
}

function match(html: string, re: RegExp): string {
  const m = html.match(re);
  return m ? clean(m[1]) : '';
}

export function csrfToken(html: string): string {
  const token = html.match(/name="csrfmiddlewaretoken" value="([^"]+)"/)?.[1];
  if (!token) throw new Error('CSRF token not found on page');
  return token;
}

/** Name in the header's "Logged in as <name>", or null when logged out. */
export function loggedInAs(html: string): string | null {
  const name = match(html, /Logged in as <b>([^<]+)<\/b>/);
  return name || null;
}

/** Rows of the cart table on /view_cart (also used by the checkout review table). */
export function cartRows(html: string): CartRow[] {
  return [...html.matchAll(/<tr id="product-(\d+)">([\s\S]*?)<\/tr>/g)].map(([, id, row]) => ({
    productId: Number(id),
    name: match(row, /<h4><a[^>]*>([\s\S]*?)<\/a><\/h4>/),
    category: match(row, /<td class="cart_description">[\s\S]*?<p>([\s\S]*?)<\/p>/),
    price: match(row, /<td class="cart_price">\s*<p>([\s\S]*?)<\/p>/),
    quantity: Number(match(row, /<td class="cart_quantity">\s*<button[^>]*>([\s\S]*?)<\/button>/)),
    total: match(row, /class="cart_total_price">([\s\S]*?)<\/p>/),
  }));
}

/** Delivery (`address_delivery`) or billing (`address_invoice`) block on /checkout. */
export function checkoutAddress(html: string, id: 'address_delivery' | 'address_invoice'): CheckoutAddress {
  const block = html.match(new RegExp(`<ul[^>]*id="${id}"[^>]*>([\\s\\S]*?)</ul>`))?.[1];
  if (!block) throw new Error(`Address block #${id} not found on page`);
  const items = [...block.matchAll(/<li class="([^"]+)">([\s\S]*?)<\/li>/g)].map(([, cls, text]) => ({ cls, text: clean(text) }));
  const byClass = (cls: string) => items.filter((i) => i.cls.startsWith(cls)).map((i) => i.text);
  return {
    fullName: byClass('address_firstname')[0] ?? '',
    lines: byClass('address_address1'),
    cityStateZip: byClass('address_city')[0] ?? '',
    country: byClass('address_country_name')[0] ?? '',
    phone: byClass('address_phone')[0] ?? '',
  };
}

export function pageText(html: string): string {
  return clean(html.replace(/<(script|style)[\s\S]*?<\/\1>/g, ''));
}
