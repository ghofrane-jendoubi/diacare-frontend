import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../services/serv-market/order.service';
import { DeliveryService } from '../../../services/delivery.service';
import { Order } from '../../../models/order';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

declare var bootstrap: any; // Pour utiliser le modal Bootstrap natif

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  error = '';

  // Suivi livraison
  delivery: any = null;
  loadingDelivery = false;
  private modalInstance: any;

  constructor(
    private orderService: OrderService,
    private deliveryService: DeliveryService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erreur chargement commandes';
        this.loading = false;
      }
    });
  }

  loadOrders() {
    this.orderService.getOrders().subscribe(data => this.orders = data);
  }

  pay(orderId: number) {
    this.http.post(`http://localhost:8080/api/orders/pay/${orderId}`, {})
      .subscribe(() => {
        alert('Paiement réussi 💳');
        this.loadOrders();
      });
  }

  deleteOrder(id: number) {
    if (confirm('Supprimer cette commande ?')) {
      this.orderService.deleteOrder(id).subscribe({
        next: () => this.orders = this.orders.filter(o => o.id !== id),
        error: err => console.error(err)
      });
    }
  }

  goToPayment(order: any) {
    localStorage.setItem('pendingOrder', JSON.stringify(order));
    this.router.navigate(['/patient/paiement']);
  }

  // ==================== SUIVI LIVRAISON ====================
  openTrackingModal(orderId: number) {
    this.loadingDelivery = true;
    this.deliveryService.getDelivery(orderId).subscribe({
      next: (data) => {
        this.delivery = data;
        this.loadingDelivery = false;
        const modalEl = document.getElementById('trackingModal');
        if (modalEl) {
          this.modalInstance = new bootstrap.Modal(modalEl);
          this.modalInstance.show();
        }
      },
      error: (err) => {
        console.error(err);
        this.loadingDelivery = false;
        alert('Impossible de récupérer le suivi de livraison.');
      }
    });
  }

  isStatus(status: string): boolean {
    return this.delivery?.status === status;
  }
}