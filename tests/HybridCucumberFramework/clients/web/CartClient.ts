import { WebClient } from '../../core/WebClient';
import { CartRow } from '../../models/types';
import { cartRows, pageText } from '../../utils/htmlParser';

/** The AJAX endpoints behind the "Add to cart" / "X" buttons, plus the /view_cart page. */
export class CartClient extends WebClient {
  /** "Rs. 1,500" -> 1500 */
  static toAmount(price: string): number {
    return Number(price.replace(/[^\d]/g, ''));
  }

  async add(productId: number, quantity?: number): Promise<string> {
    const page = await this.getPage(`/add_to_cart/${productId}`, quantity ? { params: { quantity } } : {});
    return pageText(page.html);
  }

  async remove(productId: number): Promise<string> {
    return pageText((await this.getPage(`/delete_cart/${productId}`)).html);
  }

  async view(): Promise<{ rows: CartRow[]; isEmpty: boolean }> {
    const { html } = await this.getPage('/view_cart');
    return { rows: cartRows(html), isEmpty: pageText(html).includes('Cart is empty!') };
  }
}
