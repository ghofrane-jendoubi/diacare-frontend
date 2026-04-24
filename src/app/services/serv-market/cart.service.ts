// cart.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cart } from '../../models/cart';
import { AuthService } from '../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private baseUrl = environment.apiUrl.replace('/admin', '');
  private apiUrl = `${this.baseUrl}/cart`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getPatientId(): number | null {
    const user = this.authService.getCurrentUser();
    if (user && user.id) {
      return user.id;
    }
    
    const patientId = localStorage.getItem('patient_id') || 
                      localStorage.getItem('userId') ||
                      localStorage.getItem('user_id');
    
    return patientId ? parseInt(patientId) : null;
  }

  getCart(): Observable<Cart> {
    const patientId = this.getPatientId();
    if (!patientId) {
      throw new Error('Patient non authentifié');
    }
    
    const params = new HttpParams().set('patientId', patientId.toString());
    return this.http.get<Cart>(this.apiUrl, { params });
  }

  addToCart(productId: number, quantity: number): Observable<Cart> {
    const patientId = this.getPatientId();
    if (!patientId) {
      throw new Error('Patient non authentifié');
    }
    
    const params = new HttpParams()
      .set('patientId', patientId.toString())
      .set('productId', productId.toString())
      .set('qty', quantity.toString());
    
    return this.http.post<Cart>(`${this.apiUrl}/add`, null, { params });
  }

  updateCartItem(itemId: number, quantity: number): Observable<Cart> {
    const patientId = this.getPatientId();
    if (!patientId) {
      throw new Error('Patient non authentifié');
    }
    
    const params = new HttpParams().set('patientId', patientId.toString());
    return this.http.put<Cart>(`${this.apiUrl}/items/${itemId}`, { quantity }, { params });
  }

  removeCartItem(itemId: number): Observable<void> {
    const patientId = this.getPatientId();
    if (!patientId) {
      throw new Error('Patient non authentifié');
    }
    
    const params = new HttpParams().set('patientId', patientId.toString());
    return this.http.delete<void>(`${this.apiUrl}/items/${itemId}`, { params });
  }
}