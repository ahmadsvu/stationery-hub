export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  image: string;
  date: string;
  author: string;
}

export interface Order {
  id: string;
  products: CartItem[];
  subtotal:number;
  total: number;
  status: 'pending' | 'canceled' | 'delivered';
  area: string;
  address: string;
  phone: string;
  name: string;
  createdAt: string;
}