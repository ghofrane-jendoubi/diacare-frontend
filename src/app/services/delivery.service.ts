import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  private apiUrl = 'http://localhost:8081/api/delivery';

  constructor(private http: HttpClient) {}

  getDelivery(orderId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/order/${orderId}`);
  }

  updateStatus(orderId: number, status: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${orderId}/status`,
      {},
      { params: { status } }
    );
  }

  createDelivery(orderId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/order/${orderId}`, {});
  }
}