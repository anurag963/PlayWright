/**
 * Response models for https://automationexercise.com/api_list.
 * Every endpoint answers HTTP 200; the real status lives in `responseCode`.
 */
export interface ApiBody {
  responseCode: number;
  message?: string;
}

export interface Product {
  id: number;
  name: string;
  price: string; // e.g. "Rs. 500"
  brand: string;
  category: {
    usertype: { usertype: string }; // Women | Men | Kids
    category: string; // Tops | Jeans | ...
  };
}

export interface Brand {
  id: number;
  brand: string;
}

export interface UserDetail {
  id: number;
  name: string;
  email: string;
  title: string;
  birth_day: string;
  birth_month: string;
  birth_year: string;
  first_name: string;
  last_name: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
}

export interface ProductsBody extends ApiBody {
  products: Product[];
}

export interface BrandsBody extends ApiBody {
  brands: Brand[];
}

export interface UserDetailBody extends ApiBody {
  user: UserDetail;
}

/** One row of the /view_cart table. */
export interface CartRow {
  productId: number;
  name: string;
  category: string; // e.g. "Women > Tops"
  price: string;
  quantity: number;
  total: string;
}

/** One address block (delivery or billing) on the /checkout page. */
export interface CheckoutAddress {
  fullName: string; // "Mr. Test User"
  lines: string[]; // company, address1, address2
  cityStateZip: string;
  country: string;
  phone: string;
}
