import { Cartitem } from "./cartitem";

export interface Cart {
    
  id: number;
  items: Cartitem[];
  totalPrice: number;
}

