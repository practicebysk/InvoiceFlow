export interface User {
  email: string;
  shopName: string;
  shopAddress: string;
}

export interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  discount: number; // in %
}

export interface Invoice {
  customerName: string;
  items: InvoiceItem[];
  total: number;
  date: string;
}
