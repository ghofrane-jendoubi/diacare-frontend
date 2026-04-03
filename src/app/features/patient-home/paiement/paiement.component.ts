import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CartService } from '../../../services/serv-market/cart.service';
import { OrderService } from '../../../services/serv-market/order.service';
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
  // Normal payment fields
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

  // Email action fields
  action: string | null = null;          // 'confirm' or 'cancel'
  emailActionOrderId: number | null = null;
  emailActionProcessing = false;
  emailActionError = '';
  emailActionSuccess = false;
  emailActionOrder: any = null;           // store order details after action

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Check if we have an email action (action and orderId parameters)
    this.route.queryParams.subscribe(params => {
      const actionParam = params['action'];
      const orderIdParam = params['orderId'];
      if (actionParam && orderIdParam) {
        this.action = actionParam;
        this.emailActionOrderId = +orderIdParam;
        this.handleEmailAction();
      } else {
        // Normal payment flow
        this.handleNormalPayment();
      }
    });
  }

  // -------------------------------------------------------------------
  // Email action handling (confirm / cancel)
  // -------------------------------------------------------------------
  handleEmailAction(): void {
    this.emailActionProcessing = true;
    if (this.action === 'confirm') {
      this.orderService.confirmOrder(this.emailActionOrderId!).subscribe({
        next: (order) => {
          this.emailActionOrder = order;
          this.emailActionProcessing = false;
          this.emailActionSuccess = true;
          // Trigger PDF + confetti in this tab
          this.triggerSuccess(order);
          // Notify other tabs to also show confetti
          // Remove query params to avoid re‑execution on refresh
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
          // Remove query params
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

  // -------------------------------------------------------------------
  // Normal payment flow (cart or stored order)
  // -------------------------------------------------------------------
  handleNormalPayment(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Only run this code in the browser
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
      // SSR context – fallback
      console.warn('localStorage is not available on the server, skipping pending order.');
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

  payer(): void {
    if (!this.nom || !this.numero || !this.date || !this.cvc || !this.email) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    this.loading = true;

    if (this.order) {
      // Payment for an existing order (from orders page)
      this.orderService.markOrderAsPaid(this.order.id, this.email).subscribe({
        next: (updatedOrder) => {
          this.loading = false;
          this.success = true;
          
        },
        error: () => {
          this.loading = false;
          alert('Erreur lors du paiement');
        }
      });
    } else {
      // Payment from cart (create new order)
      this.orderService.checkout().subscribe({
        next: (newOrder) => {
          this.loading = false;
          this.success = true;
          
        },
        error: () => {
          this.loading = false;
          alert('Erreur lors du paiement');
        }
      });
    }
  }

  // -------------------------------------------------------------------
  // Success actions (PDF + confetti)
  // -------------------------------------------------------------------
  private triggerSuccess(order: any): void {
  if (isPlatformBrowser(this.platformId)) {
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 }
    });

    this.generatePDF(order);
  }
}

  generatePDF(order: any): void {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Facture Diacare', 20, 20);
    doc.setFontSize(12);
    doc.text('Client: ' + (order.user?.name || 'Client'), 20, 30);
    doc.text('Date: ' + new Date().toLocaleDateString(), 20, 40);
    let y = 60;
    const items = order.orderItems || order.items;
    items.forEach((item: any) => {
      doc.text(`${item.product.name} x${item.quantity} = ${item.price * item.quantity} DT`, 20, y);
      y += 10;
    });
    doc.text('Total: ' + (order.totalPrice ?? order.total) + ' DT', 20, y + 10);
    doc.save('facture.pdf');
  }
}