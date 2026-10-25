import { WebClient } from '../../core/WebClient';
import { CardData } from '../../utils/dataFactory';
import { cartRows, checkoutAddress, loggedInAs, pageText } from '../../utils/htmlParser';

/** /checkout -> /payment -> /payment_done/{amount} -> /download_invoice/{amount} */
export class CheckoutClient extends WebClient {
  async view() {
    const { html } = await this.getPage('/checkout');
    return {
      loggedInAs: loggedInAs(html),
      delivery: checkoutAddress(html, 'address_delivery'),
      billing: checkoutAddress(html, 'address_invoice'),
      items: cartRows(html),
      text: pageText(html),
    };
  }

  async pay(card: CardData) {
    const page = await this.submitForm('/payment', '/payment', {
      name_on_card: card.nameOnCard,
      card_number: card.cardNumber,
      cvc: card.cvc,
      expiry_month: card.expiryMonth,
      expiry_year: card.expiryYear,
    });
    return {
      url: page.url,
      /** Order total, taken from the /payment_done/{amount} redirect. */
      amount: page.url.match(/\/payment_done\/(\d+)/)?.[1] ?? null,
      text: pageText(page.html),
    };
  }

  async downloadInvoice(amount: string) {
    const res = await this.send('GET', `/download_invoice/${amount}`);
    return {
      status: res.status(),
      fileName: res.headers()['content-disposition']?.match(/filename="?([^";]+)"?/)?.[1] ?? null,
      contentType: res.headers()['content-type'],
      text: await res.text(),
    };
  }
}
