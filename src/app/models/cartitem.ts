export interface Cartitem {
    id: number;
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
    type: string;        // ← AJOUTE CETTE LIGNE
  };
  quantity: number;
}