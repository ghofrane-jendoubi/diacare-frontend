export interface Cartitem {
    id: number;
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
    type: string;       
  };
  quantity: number;
}