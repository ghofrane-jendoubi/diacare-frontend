import { OrderItem } from "./order-item";

export interface Order {
  id: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}