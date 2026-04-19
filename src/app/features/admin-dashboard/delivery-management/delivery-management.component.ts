import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../services/serv-market/order.service';
import { DeliveryService } from '../../../services/delivery.service';

@Component({
  selector: 'app-delivery-management',
  templateUrl: './delivery-management.component.html'
})
export class DeliveryManagementComponent implements OnInit {
  orders: any[] = [];
  statuses = ['CONFIRMED', 'PREPARING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

  constructor(
    private orderService: OrderService,
    private deliveryService: DeliveryService
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getPaidOrders().subscribe(data => {
        this.orders = data;
        this.orders.forEach(order => {
            this.deliveryService.getDelivery(order.id).subscribe({
                next: delivery => order.deliveryStatus = delivery.status,
                error: () => order.deliveryStatus = 'Non créée'
            });
        });
    });
}

  updateStatus(orderId: number, event: any) {
    const newStatus = event.target.value;
    this.deliveryService.updateStatus(orderId, newStatus).subscribe({
      next: () => {
        alert('Statut mis à jour');
        this.loadOrders(); // rafraîchir
      },
      error: () => alert('Erreur')
    });
  }

  getBadgeClass(status: string): string {
    switch(status) {
      case 'DELIVERED': return 'bg-success';
      case 'CANCELLED': return 'bg-danger';
      case 'OUT_FOR_DELIVERY': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }
}