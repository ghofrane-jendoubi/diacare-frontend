import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { loadStripe, Stripe } from '@stripe/stripe-js';

@Injectable({
  providedIn: 'root'
})
export class PaiementService {

  private stripe: Stripe | null = null;
  private apiUrl = 'http://localhost:8080/api/paiement';

  constructor(private http: HttpClient) {}

  // 🔥 INIT STRIPE
  async initStripe() {
    this.stripe = await loadStripe('pk_test_51TFvVGFNjVhvrEhKqO1M0ggMXyDoEFvsLHs5vV44Bplw0eVzy5F8v4bG64UanINtkmLWwqvn8ojI6swSTSpZhnLi00IWTbX0b7'); // 👉 replace
  }

  // 🔥 CREATE PAYMENT
  createPaymentIntent(amount: number) {
    return this.http.post<any>(`${this.apiUrl}/create?amount=${amount}`, {});
  }

  // 🔥 CONFIRM ORDER
  confirmOrder(orderId: number) {
    return this.http.post(`http://localhost:8080/api/orders/pay/${orderId}`, {});
  }

  async payer(orderId: number, amount: number) {

  try {
    // 1️⃣ create intent
    const res = await firstValueFrom(this.createPaymentIntent(amount));

    const clientSecret = res.clientSecret;

    // 2️⃣ stripe payment ✅ CLEAN
    const result = await this.stripe!.confirmCardPayment(clientSecret, {
      payment_method: {
        card: { token: 'tok_visa' } // ✅ ONLY THIS
      }
    });

    // 3️⃣ handle error
    if (result.error) {
      return { success: false, error: result.error.message };
    }

    // 4️⃣ confirm order
    await firstValueFrom(
      this.http.post(`http://localhost:8080/api/orders/pay/${orderId}`, {})
    );

    return { success: true };

  } catch (e: any) {
    return { success: false, error: e.message };
  }
}}