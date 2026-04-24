import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../../services/serv-market/order.service';
import { DeliveryService } from '../../../../services/delivery.service';
import { Order } from '../../../../models/order';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

declare var bootstrap: any;

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  error = '';
  patientId: number | null = null;

  delivery: any = null;
  loadingDelivery = false;
  private modalInstance: any;

  constructor(
    private orderService: OrderService,
    private deliveryService: DeliveryService,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPatientId();
    this.loadOrders();
  }

  private loadPatientId(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.id) {
      this.patientId = user.id;
      console.log('Patient ID chargé:', this.patientId);
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
      this.error = 'Impossible de charger vos commandes. Veuillez vous reconnecter.';
      this.loading = false;
      this.router.navigate(['/login']);
    }
  }

 loadOrders(): void {
  if (!this.patientId) {
    this.error = 'Patient non identifié';
    this.loading = false;
    return;
  }
  
  this.loading = true;
  this.orderService.getOrdersByPatient(this.patientId).subscribe({
    next: (data: Order[]) => {
      console.log('Commandes reçues:', data);
      
      // ✅ S'assurer que chaque commande a un tableau items (même vide)
      this.orders = data.map(order => ({
        ...order,
        items: order.items || []  // Si items est null/undefined, mettre un tableau vide
      }));
      
      console.log('Commandes après traitement:', this.orders);
      this.loading = false;
    },
    error: (err) => {
      console.error('Erreur chargement commandes:', err);
      if (err.status === 500) {
        this.error = 'Erreur serveur. Veuillez réessayer plus tard.';
      } else if (err.status === 404) {
        this.error = 'Service non disponible.';
      } else {
        this.error = 'Erreur lors du chargement de vos commandes';
      }
      this.orders = [];
      this.loading = false;
    }
  });
}

  goToPayment(order: any): void {
    localStorage.setItem('pendingOrder', JSON.stringify(order));
    this.router.navigate(['/patient/paiement']);
  }

  deleteOrder(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      this.orderService.deleteOrder(id).subscribe({
        next: () => {
          this.orders = this.orders.filter(o => o.id !== id);
          this.showToast('Commande supprimée avec succès', 'success');
        },
        error: (err) => {
          console.error('Erreur suppression:', err);
          this.showToast('Erreur lors de la suppression', 'error');
        }
      });
    }
  }

  openTrackingModal(orderId: number): void {
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
        console.error('Erreur chargement livraison:', err);
        this.loadingDelivery = false;
        alert('Impossible de récupérer le suivi de livraison.');
      }
    });
  }

  isStatus(status: string): boolean {
    return this.delivery?.status === status;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Date inconnue';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date inconnue';
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date inconnue';
    }
  }

  getImageUrl(filename: string): string {
    if (!filename) return 'assets/placeholder.png';
    if (filename.startsWith('http')) return filename;
    return `http://localhost:8081/api/products/images/${filename}`;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PENDING': 'En attente',
      'PAID': 'Payée',
      'PROCESSING': 'En traitement',
      'SHIPPED': 'Expédiée',
      'DELIVERED': 'Livrée',
      'CANCELLED': 'Annulée'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'PENDING': 'status-pending',
      'PAID': 'status-paid',
      'PROCESSING': 'status-processing',
      'SHIPPED': 'status-shipped',
      'DELIVERED': 'status-delivered',
      'CANCELLED': 'status-cancelled'
    };
    return classes[status] || 'status-default';
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'PENDING': 'bi-clock-history',
      'PAID': 'bi-check2-circle',
      'PROCESSING': 'bi-arrow-repeat',
      'SHIPPED': 'bi-truck',
      'DELIVERED': 'bi-house-check',
      'CANCELLED': 'bi-x-circle'
    };
    return icons[status] || 'bi-question-circle';
  }

  private showToast(message: string, type: 'success' | 'error' | 'info'): void {
    const toast = document.createElement('div');
    toast.className = `toast-${type}`;
    toast.innerHTML = `
      <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
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
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
}