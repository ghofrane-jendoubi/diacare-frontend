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

}