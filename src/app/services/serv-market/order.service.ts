// order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../../models/order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiUrl = 'http://localhost:8081/api/orders';

  constructor(private http: HttpClient) {}

  // ✅ Version sans patientId (le backend filtre par l'utilisateur connecté)
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  // ✅ Checkout avec patientId
  checkout(patientId: number): Observable<any> {
    const params = new HttpParams().set('patientId', patientId.toString());
    return this.http.post(`${this.apiUrl}/checkout`, null, { params });
  }

  payOrder(orderId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/pay/${orderId}`, {});
  }

  deleteOrder(orderId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${orderId}`);
  }

  getOrderById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  markOrderAsPaid(orderId: number, email?: string): Observable<any> {
    let url = `${this.apiUrl}/${orderId}/pay`;
    if (email) {
      url += `?email=${encodeURIComponent(email)}`;
    }
    return this.http.post<any>(url, {});
  }

  confirmOrder(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/confirm`, {});
  }

  cancelOrder(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/cancel`, {});
  }

  getPaidOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/paid-orders`);
  }
  getOrdersByPatient(patientId: number): Observable<Order[]> {
    const params = new HttpParams().set('patientId', patientId.toString());
    return this.http.get<Order[]>(this.apiUrl, { params });
  }
  
}