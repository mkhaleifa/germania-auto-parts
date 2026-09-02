import type { ProductCondition } from "@/types/product";

export interface CartItem {
  productId: string;
  title: string;
  slug: string;
  price: number;
  image: string;
  condition: ProductCondition;
  quantity: number;
  maxStock: number;
}

export interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}