import { OrderItem } from "./order-item";

export interface Order {
  id: number;
  user?: {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  userId?: number;
  createdAt: string;
  status: string;
  paymentStatus: string;
  items: OrderItem[];
  totalPrice: number;
  confirmationToken?: string;
  tokenExpiration?: string;
}