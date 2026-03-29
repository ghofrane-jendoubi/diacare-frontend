export interface Product {

  id?: number;
  name: string;
  barcode: string;
  price: number;
  stock: number;
  sugarLevel: number;     // matches backend JSON field
  type: string;           // 'ALIMENTAIRE' or 'MEDICAL'
  description: string;
  image: string;
  
  category?: any;
}