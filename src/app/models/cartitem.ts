export interface Cartitem {
    id: number;
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
  };
  quantity: number;
}
