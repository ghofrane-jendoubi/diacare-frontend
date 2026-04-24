export interface Product {

  id?: number;
  name: string;
  barcode: string;
  price: number;
  stock: number;
  sugarLevel: number;    
  type: string;          
  description: string;
  image: string;
  
  category?: any;
}