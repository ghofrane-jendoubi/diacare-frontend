import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../services/serv-market/order.service';
import { DeliveryService } from '../../../services/delivery.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-delivery-management',
  templateUrl: './delivery-management.component.html',
  styleUrls: ['./delivery-management.component.css']
})
export class DeliveryManagementComponent implements OnInit {
  orders: any[] = [];
  filteredOrders: any[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  filterStatus = '';
  
  statuses = ['CONFIRMED', 'PREPARING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
  
  statusLabels: { [key: string]: string } = {
    'CONFIRMED': 'Confirmée',
    'PREPARING': 'Préparation',
    'SHIPPED': 'Expédiée',
    'OUT_FOR_DELIVERY': 'En livraison',
    'DELIVERED': 'Livrée',
    'CANCELLED': 'Annulée'
  };

  constructor(
    private orderService: OrderService,
    private deliveryService: DeliveryService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.error = '';
    
    this.orderService.getPaidOrders().subscribe({
      next: (orders) => {
        console.log('Orders loaded:', orders);
        this.orders = orders;
        this.loadDeliveryStatuses();
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.error = 'Erreur lors du chargement des commandes';
        this.loading = false;
      }
    });
  }

  loadDeliveryStatuses() {
    let completed = 0;

    if (this.orders.length === 0) {
      this.loading = false;
      this.filterOrders();
      return;
    }

    this.orders.forEach(order => {
      this.deliveryService.getDelivery(order.id).subscribe({
        next: (delivery) => {
          order.deliveryStatus = delivery?.status || 'CONFIRMED';
          order.deliveryId = delivery?.id;
          completed++;
          if (completed === this.orders.length) {
            this.loading = false;
            this.filterOrders();
          }
        },
        error: () => {
          order.deliveryStatus = 'CONFIRMED';
          completed++;
          if (completed === this.orders.length) {
            this.loading = false;
            this.filterOrders();
          }
        }
      });
    });
  }

  updateStatus(orderId: number, event: any) {
    const newStatus = event.target.value;
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    const label = this.statusLabels[newStatus] || newStatus;
    if (!confirm(`Changer le statut de la commande #${orderId} vers "${label}" ?`)) {
      event.target.value = order.deliveryStatus;
      return;
    }

    this.deliveryService.updateStatus(orderId, newStatus).subscribe({
      next: (updatedDelivery) => {
        order.deliveryStatus = updatedDelivery.status;
        this.showToast(`Commande #${orderId} → ${label}`, 'success');
        this.filterOrders();
      },
      error: (err) => {
        console.error('Erreur mise à jour statut:', err);
        event.target.value = order.deliveryStatus;
        this.showToast('Erreur lors de la mise à jour', 'error');
      }
    });
  }

  // ✅ Méthodes mises à jour pour utiliser les champs du DTO
  getFullName(order: any): string {
    // Utiliser les champs du DTO d'abord
    if (order.patientFirstName || order.patientLastName) {
      const firstName = order.patientFirstName || '';
      const lastName = order.patientLastName || '';
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }
    }
    
    // Fallback: essayer l'objet user si présent
    if (order.user) {
      const firstName = order.user.firstName || order.user.firstname || '';
      const lastName = order.user.lastName || order.user.lastname || '';
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }
      return order.user.name || order.user.username || 'Client';
    }
    
    return `Client #${order.id}`;
  }

  getInitials(order: any): string {
    const fullName = this.getFullName(order);
    if (fullName === `Client #${order.id}`) return 'C';
    const parts = fullName.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  getEmail(order: any): string {
    // Utiliser le champ email du DTO
    if (order.patientEmail) {
      return order.patientEmail;
    }
    
    // Fallback: essayer l'objet user
    if (order.user) {
      return order.user.email || order.user.Email || 'Non renseigné';
    }
    
    return 'Email non disponible';
  }

  getPhone(order: any): string {
    if (order.user) {
      return order.user.phone || order.user.Phone || order.user.telephone || '';
    }
    return '';
  }

  onSearch() {
    this.filterOrders();
  }

  onFilterChange() {
    this.filterOrders();
  }

  filterOrders() {
    this.filteredOrders = this.orders.filter(order => {
      const searchLower = this.searchTerm.toLowerCase();
      const matchesSearch = !this.searchTerm || 
        order.id.toString().includes(searchLower) ||
        this.getFullName(order).toLowerCase().includes(searchLower) ||
        this.getEmail(order).toLowerCase().includes(searchLower);
      
      const matchesStatus = !this.filterStatus || order.deliveryStatus === this.filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }

  getBadgeClass(status: string): string {
    switch(status) {
      case 'DELIVERED': return 'bg-success';
      case 'CANCELLED': return 'bg-danger';
      case 'OUT_FOR_DELIVERY': return 'bg-info';
      case 'SHIPPED': return 'bg-primary';
      case 'PREPARING': return 'bg-warning';
      case 'CONFIRMED': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  }

  getStatusIcon(status: string): string {
    switch(status) {
      case 'DELIVERED': return 'bi-check-circle-fill';
      case 'CANCELLED': return 'bi-x-circle-fill';
      case 'OUT_FOR_DELIVERY': return 'bi-truck';
      case 'SHIPPED': return 'bi-box-seam';
      case 'PREPARING': return 'bi-arrow-repeat';
      case 'CONFIRMED': return 'bi-check2-circle';
      default: return 'bi-clock-history';
    }
  }

  getStatusLabel(status: string): string {
    return this.statusLabels[status] || status;
  }

  formatDate(date: string): string {
    if (!date) return 'Non définie';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  private showToast(message: string, type: 'success' | 'error' | 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-${type}`;
    toast.innerHTML = `
      <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
      <span>${message}</span>
    `;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      z-index: 10000;
      animation: slideIn 0.3s ease;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  refresh() {
    this.loadOrders();
  }
}