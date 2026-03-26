import { Component, Input, Output, EventEmitter, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { PaymentService } from '../../../../services/payment.service';

declare var Stripe: any;

@Component({
  selector: 'app-payment-modal',
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.css']
})
export class PaymentModalComponent implements AfterViewInit {
  @Input() show = false;
  @Input() appointment: any;
  @Input() patientId = 1;
  @Output() closeModal = new EventEmitter<void>();
  @Output() paymentSuccess = new EventEmitter<any>();

  @ViewChild('cardElement') cardElementRef!: ElementRef;

  loading = false;
  success = false;
  errorMessage = '';
  stripe: any = null;
  cardElement: any = null;

  constructor(private paymentService: PaymentService) {}

  async ngAfterViewInit() {
    await this.initStripe();
  }

 async initStripe() {
  // ✅ Récupérer l'instance retournée
  this.stripe = await this.paymentService.initializeStripe('pk_test_51TESqOPdOkHJhkaV0VzqbW3jOMKNMhkctJhM3mwhuhDzMMg6G3AMs7BxxREzNK7pGjhtdkpy8vuGkTlafoyWHexU00IWPM8chC');
  
  if (!this.stripe) {
    console.error('Stripe non initialisé');
    return;
  }

  const elements = this.stripe.elements();
  this.cardElement = elements.create('card', {
    style: {
      base: {
        fontSize: '16px',
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        '::placeholder': { color: '#aab7c4' }
      }
    }
  });

  //  Attendre que le DOM soit prêt
  setTimeout(() => {
    if (this.cardElementRef?.nativeElement) {
      this.cardElement.mount(this.cardElementRef.nativeElement);
      console.log('Stripe card monté avec succès');
    } else {
      console.error('cardElementRef non trouvé dans le DOM');
    }
  }, 200);
}

  async pay() {
  if (!this.appointment) return;
  
  this.loading = true;
  this.errorMessage = '';

  try {
    const intent = await this.paymentService.createPaymentIntent(
      this.appointment.id, 
      this.patientId
    ).toPromise();

    if (!intent.clientSecret) {
      throw new Error('Erreur de création du paiement');
    }

    const { error, paymentIntent } = await this.stripe.confirmCardPayment(intent.clientSecret, {
      payment_method: { card: this.cardElement }
    });

    if (error) {
      throw new Error(error.message);
    }

    // ✅ Le statut Stripe est "succeeded" (minuscules), le backend attend "SUCCEEDED"
    await this.paymentService.confirmPayment(
      paymentIntent.id, 
      paymentIntent.status.toUpperCase()  // ✅ convertir en majuscules
    ).toPromise();
    
    this.success = true;
    this.paymentSuccess.emit(this.appointment);
    
  } catch (error: any) {
    this.errorMessage = error.message || 'Erreur de paiement';
  } finally {
    this.loading = false;
  }
}
  onSuccess() {
    this.close();
    this.paymentSuccess.emit(this.appointment);
  }

  close() {
    this.show = false;
    this.success = false;
    this.errorMessage = '';
    this.closeModal.emit();
  }
}