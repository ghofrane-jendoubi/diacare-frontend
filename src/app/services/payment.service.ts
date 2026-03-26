import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { loadStripe, Stripe } from '@stripe/stripe-js';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:8081/api/payments';
  private stripe: Stripe | null = null;

  constructor(private http: HttpClient) {}

  async initializeStripe(publishableKey: string): Promise<any> {
  this.stripe = await loadStripe(publishableKey);
  return this.stripe; 
}

  createPaymentIntent(appointmentId: number, patientId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-intent`, { appointmentId, patientId });
  }

  confirmPayment(paymentIntentId: string, status: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/confirm`, { paymentIntentId, status });
  }

  checkMeetAccess(appointmentId: number, patientId: number): Observable<{ canAccess: boolean }> {
    return this.http.get<{ canAccess: boolean }>(`${this.apiUrl}/check-access/${appointmentId}/${patientId}`);
  }

  isAppointmentPaid(appointmentId: number): Observable<{ isPaid: boolean }> {
    return this.http.get<{ isPaid: boolean }>(`${this.apiUrl}/paid/${appointmentId}`);
  }

  async processPayment(appointmentId: number, patientId: number, amount: number): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. Créer le PaymentIntent
      const intent = await this.createPaymentIntent(appointmentId, patientId).toPromise();
      
      if (!intent || !intent.clientSecret) {
        return { success: false, error: 'Erreur de création du paiement' };
      }

      // 2. Confirmer le paiement avec Stripe
      if (this.stripe) {
        const { error, paymentIntent } = await this.stripe.confirmCardPayment(intent.clientSecret);
        
        if (error) {
          return { success: false, error: error.message };
        }

        // 3. Confirmer côté backend
        await this.confirmPayment(paymentIntent.id, paymentIntent.status).toPromise();
        
        return { success: true };
      }
      
      return { success: false, error: 'Stripe non initialisé' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
   
}