import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CartService } from '../../../../services/serv-market/cart.service';
import { OrderService } from '../../../../services/serv-market/order.service';
import { AuthService } from '../../../../core/services/auth.service';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';

@Component({
  selector: 'app-paiement',
  templateUrl: './paiement.component.html',
  styleUrls: ['./paiement.component.css']
})
export class PaiementComponent implements OnInit {
  cart: any = { items: [] };
  total = 0;
  order: any = null;
  nom = '';
  numero = '';
  date = '';
  cvc = '';
  email = '';
  loading = false;
  error = '';
  success = false;
  patientId: number | null = null;
  emailSent = false; // Add this flag

  action: string | null = null;
  emailActionOrderId: number | null = null;
  emailActionProcessing = false;
  emailActionError = '';
  emailActionSuccess = false;
  emailActionOrder: any = null;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadPatientId();
    
    this.route.queryParams.subscribe(params => {
      const actionParam = params['action'];
      const orderIdParam = params['orderId'];
      if (actionParam && orderIdParam) {
        this.action = actionParam;
        this.emailActionOrderId = +orderIdParam;
        this.handleEmailAction();
      } else {
        this.handleNormalPayment();
      }
    });
  }

  private loadPatientId(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.id) {
      this.patientId = user.id;
    } else {
      const patientId = localStorage.getItem('patient_id') || 
                        localStorage.getItem('userId') ||
                        localStorage.getItem('user_id');
      if (patientId) {
        this.patientId = parseInt(patientId);
      }
    }
    
    if (!this.patientId) {
      console.error('Patient ID non trouvé');
      this.error = 'Patient non identifié. Veuillez vous reconnecter.';
    }
  }

  handleEmailAction(): void {
    this.emailActionProcessing = true;
    if (this.action === 'confirm') {
      this.orderService.confirmOrder(this.emailActionOrderId!).subscribe({
        next: (order) => {
          this.emailActionOrder = order;
          this.emailActionProcessing = false;
          this.emailActionSuccess = true;
          // Show email confirmation before PDF
          this.showEmailConfirmationAndGeneratePDF(order);
          this.router.navigate([], { queryParams: { action: null, orderId: null }, queryParamsHandling: 'merge' });
        },
        error: (err) => {
          console.error(err);
          this.emailActionProcessing = false;
          this.emailActionError = 'Erreur lors de la confirmation.';
        }
      });
    } else if (this.action === 'cancel') {
      this.orderService.cancelOrder(this.emailActionOrderId!).subscribe({
        next: () => {
          this.emailActionProcessing = false;
          this.emailActionSuccess = true;
          this.router.navigate([], { queryParams: { action: null, orderId: null }, queryParamsHandling: 'merge' });
        },
        error: (err) => {
          console.error(err);
          this.emailActionProcessing = false;
          this.emailActionError = 'Erreur lors de l\'annulation.';
        }
      });
    } else {
      this.emailActionError = 'Action inconnue.';
      this.emailActionProcessing = false;
    }
  }

  handleNormalPayment(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storedOrder = localStorage.getItem('pendingOrder');
      if (storedOrder) {
        try {
          this.order = JSON.parse(storedOrder);
          localStorage.removeItem('pendingOrder');
          const items = this.order.orderItems || this.order.items;
          if (items) {
            this.cart = { items: items };
            this.total = this.order.totalPrice ?? this.order.total ?? 0;
          }
        } catch (e) {
          console.error('Failed to parse pending order:', e);
        }
      } else {
        this.loadCart();
      }
    } else {
      this.loadCart();
    }
  }

  loadCart(): void {
    this.cartService.getCart().subscribe({
      next: (data) => {
        this.cart = data || { items: [] };
        this.total = this.cart.items.reduce(
          (sum: number, item: any) => sum + item.product.price * item.quantity,
          0
        );
      },
      error: () => {
        this.cart = { items: [] };
        this.total = 0;
      }
    });
  }

  getImageUrl(imageName: string): string {
    if (!imageName) {
      return 'assets/default-product.png';
    }
    if (imageName.startsWith('http')) {
      return imageName;
    }
    return `http://localhost:8081/api/products/images/${imageName}`;
  }

  payer(): void {
    if (!this.nom || !this.numero || !this.date || !this.cvc || !this.email) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    if (!this.patientId) {
      alert('Patient non identifié. Veuillez vous reconnecter.');
      return;
    }

    this.loading = true;
    this.emailSent = false;

    if (this.order) {
      this.orderService.markOrderAsPaid(this.order.id, this.email).subscribe({
        next: (updatedOrder) => {
          this.loading = false;
          this.success = true;
          this.emailSent = true;
          // Show email confirmation message BEFORE generating PDF
          this.showEmailConfirmationAndGeneratePDF(updatedOrder);
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
          alert('Erreur lors du paiement. Veuillez réessayer.');
        }
      });
    } else {
      this.orderService.checkout(this.patientId).subscribe({
        next: (newOrder) => {
          this.loading = false;
          this.success = true;
          this.emailSent = true;
          // Show email confirmation message BEFORE generating PDF
          this.showEmailConfirmationAndGeneratePDF(newOrder);
        },
        error: (err) => {
          console.error('Erreur checkout:', err);
          this.loading = false;
          alert('Erreur lors du paiement. Veuillez réessayer.');
        }
      });
    }
  }

  // New method to show email was sent before generating PDF
  private showEmailConfirmationAndGeneratePDF(order: any): void {
    if (isPlatformBrowser(this.platformId)) {
      // First alert to confirm email was sent
      alert(`✅ Email envoyé !\n\nUn email de confirmation a été envoyé à :\n${this.email}\n\nLa facture va maintenant être téléchargée.`);
      
      // Generate PDF after alert
      setTimeout(() => {
        this.generatePDF(order);
        
        // Trigger confetti after PDF
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 }
        });
      }, 500);
    }
  }

  generatePDF(order: any): void {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Facture Diacare', 20, 20);
    doc.setFontSize(12);
    doc.text('Client: ' + (order.user?.name || 'Client'), 20, 30);
    doc.text('Email: ' + this.email, 20, 40);
    doc.text('Date: ' + new Date().toLocaleDateString(), 20, 50);
    let y = 70;
    const items = order.orderItems || order.items;
    if (items && items.length) {
      items.forEach((item: any) => {
        doc.text(`${item.product?.name || 'Produit'} x${item.quantity} = ${item.price * item.quantity} DT`, 20, y);
        y += 10;
      });
    }
    doc.text('Total: ' + (order.totalPrice ?? order.total) + ' DT', 20, y + 10);
    doc.save('facture.pdf');
  }
}