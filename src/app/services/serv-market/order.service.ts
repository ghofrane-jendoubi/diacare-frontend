import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../../models/order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiUrl = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) {}

  // 🔥 CHECKOUT
 checkout(): Observable<any> {
  return this.http.post('http://localhost:8080/api/orders/checkout', {});
}
  getOrders() {
  return this.http.get<Order[]>(this.apiUrl);
}


payOrder(orderId: number) {
  return this.http.post(`http://localhost:8080/api/orders/pay/${orderId}`, {});
}
  deleteOrder(orderId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${orderId}`);
  }
  getOrderById(id: number): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/${id}`);
}


markOrderAsPaid(orderId: number, email?: string): Observable<any> {
  let url = `http://localhost:8080/api/orders/${orderId}/pay`;
  if (email) {
    url += `?email=${encodeURIComponent(email)}`;
  }
  return this.http.post<any>(url, {});
}
confirmOrder(id: number) {
  return this.http.post(`/api/orders/${id}/confirm`, {});
}

cancelOrder(id: number) {
  return this.http.post(`/api/orders/${id}/cancel`, {});
}

}