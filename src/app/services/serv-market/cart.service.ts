import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cart } from '../../models/cart';


@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:8080/api/cart';  // adjust if using proxy or full URL

  constructor(private http: HttpClient) {}

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.apiUrl);
  }

  addToCart(productId: number, quantity: number): Observable<Cart> {
    const params = {
      productId: productId.toString(),
      qty: quantity.toString()
    };
    return this.http.post<Cart>(`${this.apiUrl}/add`, null, { params });
  }

  // Placeholders for future endpoints (update and delete)
  updateCartItem(itemId: number, quantity: number): Observable<Cart> {
    return this.http.put<Cart>(`${this.apiUrl}/items/${itemId}`, { quantity });
  }

 removeCartItem(itemId: number) {
  return this.http.delete(`http://localhost:8080/api/cart/items/${itemId}`);
}

}