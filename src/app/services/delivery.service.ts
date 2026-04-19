// src/app/services/delivery.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  private apiUrl = 'http://localhost:8080/api/delivery';

  constructor(private http: HttpClient) {}

  // Get delivery for a specific order (patient & admin)
  getDelivery(orderId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/order/${orderId}`);
  }

  // Admin: update delivery status
  updateStatus(orderId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${orderId}/status?status=${status}`, {});
  }

  // Admin: get all paid orders (optional)
  getPaidOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/paid-orders`);
  }
}