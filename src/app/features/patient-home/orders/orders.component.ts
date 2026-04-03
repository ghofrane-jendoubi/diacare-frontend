import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../services/serv-market/order.service';
import { Order } from '../../../models/order';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { PaiementService } from '../../../services/serv-market/paiement.service';
@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {

  orders: Order[] = [];
  loading = true;
  error = '';

  constructor(private orderService: OrderService,
      private http: HttpClient,
      private router: Router,
      private paiementService: PaiementService

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
  this.orderService.getOrders().subscribe(data => {
    this.orders = data;
  });
}
pay(orderId: number) {
  this.http.post(`http://localhost:8080/api/orders/pay/${orderId}`, {})
    .subscribe(() => {
      alert('Paiement réussi 💳');
      this.loadOrders();
    });
}
deleteOrder(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      this.orderService.deleteOrder(id).subscribe({
        next: () => {
          // Remove from list locally
          this.orders = this.orders.filter(o => o.id !== id);
          console.log('Order deleted');
        },
        error: (err) => console.error('Error deleting order', err)
      });
    }}
goToPayment(order: any): void {
  localStorage.setItem('pendingOrder', JSON.stringify(order));
  this.router.navigate(['/patient/paiement']);
}

}

    