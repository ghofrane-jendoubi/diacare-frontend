import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../services/serv-market/order.service';
import { Order } from '../../../models/order';
import { HttpClient } from '@angular/common/http';
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
      private http: HttpClient

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
}