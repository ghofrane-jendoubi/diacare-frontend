import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  private apiUrl = 'http://localhost:8081/api/delivery';
  private orderApiUrl = 'http://localhost:8081/api/orders';

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

  getAllDeliveries(): Observable<any[]> {
    return this.http.get<any[]>(`${this.orderApiUrl}/paid-orders`).pipe(
      map((orders: any[]) => {
        return orders.map(order => ({
          id: order.id,
          orderId: order.id,
          status: order.deliveryStatus || order.status || 'CONFIRMED',
          patientName: order.patientFirstName ? `${order.patientFirstName} ${order.patientLastName || ''}` : 'Client',
          address: order.shippingAddress || 'Adresse non spécifiée',
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        }));
      }),
      catchError(error => {
        console.error('Erreur chargement livraisons:', error);
        return of([]);
      })
    );
  }
}