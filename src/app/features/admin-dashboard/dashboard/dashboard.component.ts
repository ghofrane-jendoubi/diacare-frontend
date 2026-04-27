import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminDataService } from '../../../core/services/admin-data.service';
import { OrderService } from '../../../services/serv-market/order.service';
import { DeliveryService } from '../../../services/delivery.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentDate = new Date();
  isLoading = true;

  statistics: any[] = [];
  
  revenueStats = {
    totalRevenue: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    todayRevenue: 0,
    averageOrderValue: 0
  };
  
  orderStats = {
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0
  };
  
  deliveryStats = {
    pendingDeliveries: 0,
    outForDelivery: 0,
    completedDeliveries: 0
  };
  
  userStats = {
    totalPatients: 0,
    totalDoctors: 0,
    totalNutritionists: 0,
    pendingVerifications: 0,
    newThisMonth: 0
  };
  
  pendingDoctors: any[] = [];
  pendingNutritionists: any[] = [];
  recentOrders: any[] = [];
  
  private refreshInterval: any;

  constructor(
    private adminDataService: AdminDataService,
    private orderService: OrderService,
    private deliveryService: DeliveryService
  ) {}

  ngOnInit(): void {
    this.loadAllData();
    this.refreshInterval = setInterval(() => {
      this.refreshData();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  // Normalisation des statuts
  private normalizeStatus(status: string): string {
    if (!status) return 'CONFIRMED';
    
    const upperStatus = status.toUpperCase();
    
    if (upperStatus === 'DELIVERED' || upperStatus === 'LIVREE') {
      return 'DELIVERED';
    }
    if (upperStatus === 'CONFIRMED' || upperStatus === 'CONFIRMÉE') {
      return 'CONFIRMED';
    }
    if (upperStatus === 'PREPARING' || upperStatus === 'PRÉPARATION') {
      return 'PREPARING';
    }
    if (upperStatus === 'OUT_FOR_DELIVERY' || upperStatus === 'EN LIVRAISON') {
      return 'OUT_FOR_DELIVERY';
    }
    if (upperStatus === 'SHIPPED') {
      return 'SHIPPED';
    }
    if (upperStatus === 'CANCELLED') {
      return 'CANCELLED';
    }
    
    return status;
  }

  loadAllData(): void {
    this.isLoading = true;
    
    // Charger les médecins en attente
    this.adminDataService.getAllDoctorsByStatus('PENDING').subscribe({
      next: (doctors: any[]) => {
        this.pendingDoctors = doctors || [];
        this.updateUserStats();
      },
      error: (err: any) => console.error('Erreur chargement médecins:', err)
    });
    
    // Charger les nutritionnistes en attente
    this.adminDataService.getAllNutritionistsByStatus('PENDING').subscribe({
      next: (nutritionists: any[]) => {
        this.pendingNutritionists = nutritionists || [];
        this.updateUserStats();
      },
      error: (err: any) => console.error('Erreur chargement nutritionnistes:', err)
    });
    
    // Charger tous les patients
    this.adminDataService.getAllPatients().subscribe({
      next: (patients: any[]) => {
        this.userStats.totalPatients = patients ? patients.length : 0;
        this.updateUserStats();
      },
      error: (err: any) => console.error('Erreur chargement patients:', err)
    });
    
    // Charger tous les médecins
    this.adminDataService.getAllDoctors().subscribe({
      next: (doctors: any[]) => {
        this.userStats.totalDoctors = doctors ? doctors.length : 0;
        this.updateUserStats();
      },
      error: (err: any) => console.error('Erreur chargement médecins:', err)
    });
    
    // Charger tous les nutritionnistes
    this.adminDataService.getAllNutritionists().subscribe({
      next: (nutritionists: any[]) => {
        this.userStats.totalNutritionists = nutritionists ? nutritionists.length : 0;
        this.updateUserStats();
        this.updateStatistics();
      },
      error: (err: any) => console.error('Erreur chargement nutritionnistes:', err)
    });
    
    // Charger les commandes
    this.orderService.getPaidOrders().subscribe({
      next: (orders: any[]) => {
        const orderList = orders || [];
        this.recentOrders = orderList.slice(0, 10);
        this.calculateRevenueStats(orderList);
        this.calculateOrderStats(orderList);
        this.updateStatistics();
      },
      error: (err: any) => console.error('Erreur chargement commandes:', err)
    });
    
    setTimeout(() => {
      this.isLoading = false;
    }, 1500);
  }

  calculateRevenueStats(orders: any[]): void {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentWeek = this.getWeekNumber(now);
    
    let totalRevenue = 0;
    let monthlyRevenue = 0;
    let weeklyRevenue = 0;
    let todayRevenue = 0;
    
    orders.forEach(order => {
      const amount = order.totalAmount || order.amount || order.total || order.totalPrice || 0;
      
      totalRevenue += amount;
      
      const orderDate = new Date(order.createdAt || order.date || order.orderDate);
      
      if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
        monthlyRevenue += amount;
      }
      
      if (this.getWeekNumber(orderDate) === currentWeek && orderDate.getFullYear() === currentYear) {
        weeklyRevenue += amount;
      }
      
      if (orderDate.toDateString() === now.toDateString()) {
        todayRevenue += amount;
      }
    });
    
    this.revenueStats = {
      totalRevenue,
      monthlyRevenue,
      weeklyRevenue,
      todayRevenue,
      averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0
    };
  }

  calculateOrderStats(orders: any[]): void {
    const deliveredCount = orders.filter(o => {
      const status = this.normalizeStatus(o.deliveryStatus || o.status);
      return status === 'DELIVERED';
    }).length;
    
    const confirmedCount = orders.filter(o => {
      const status = this.normalizeStatus(o.deliveryStatus || o.status);
      return status === 'CONFIRMED';
    }).length;
    
    const processingCount = orders.filter(o => {
      const status = this.normalizeStatus(o.deliveryStatus || o.status);
      return status === 'PREPARING' || status === 'SHIPPED';
    }).length;
    
    this.orderStats = {
      totalOrders: orders.length,
      pendingOrders: confirmedCount,
      processingOrders: processingCount,
      deliveredOrders: deliveredCount,
      cancelledOrders: orders.filter(o => this.normalizeStatus(o.deliveryStatus || o.status) === 'CANCELLED').length
    };
  }

  updateUserStats(): void {
    this.userStats.pendingVerifications = this.pendingDoctors.length + this.pendingNutritionists.length;
    this.updateStatistics();
  }

  updateStatistics(): void {
    this.statistics = [
      {
        icon: 'bi bi-people-fill',
        value: this.userStats.totalPatients.toLocaleString(),
        label: 'Patients Actifs',
        subLabel: this.userStats.newThisMonth > 0 ? `+${this.userStats.newThisMonth} ce mois` : '',
        bgColor: 'linear-gradient(135deg, #4158D0, #C850C0)'
      },
      {
        icon: 'bi bi-person-badge-fill',
        value: this.userStats.totalDoctors.toString(),
        label: 'Médecins',
        subLabel: `${this.pendingDoctors.length} en attente`,
        bgColor: 'linear-gradient(135deg, #FF512F, #DD2476)'
      },
      {
        icon: 'bi bi-apple',
        value: this.userStats.totalNutritionists.toString(),
        label: 'Nutritionnistes',
        subLabel: `${this.pendingNutritionists.length} en attente`,
        bgColor: 'linear-gradient(135deg, #11998e, #38ef7d)'
      },
      {
        icon: 'bi bi-cart-check-fill',
        value: this.revenueStats.totalRevenue.toLocaleString() + ' TND',
        label: 'Chiffre d\'affaires total',
        subLabel: `${this.revenueStats.monthlyRevenue.toLocaleString()} TND ce mois`,
        bgColor: 'linear-gradient(135deg, #F09819, #FF512F)'
      }
    ];
  }

  getExtraStats(): any[] {
    return [
      {
        icon: 'bi bi-cash-stack',
        value: this.revenueStats.monthlyRevenue.toLocaleString() + ' TND',
        label: 'Revenus du mois',
        trend: '+12%',
        color: 'success',
        bgColor: 'linear-gradient(135deg, #10b981, #059669)'
      },
      {
        icon: 'bi bi-truck',
        value: this.orderStats.pendingOrders.toString(),
        label: 'Commandes en attente',
        subLabel: `${this.deliveryStats.outForDelivery} en livraison`,
        color: 'warning',
        bgColor: 'linear-gradient(135deg, #f59e0b, #d97706)'
      },
      {
        icon: 'bi bi-check-circle',
        value: this.orderStats.deliveredOrders.toString(),
        label: 'Commandes livrées',
        subLabel: `Ce mois: ${this.orderStats.deliveredOrders}`,
        color: 'success',
        bgColor: 'linear-gradient(135deg, #10b981, #059669)'
      },
      {
        icon: 'bi bi-graph-up',
        value: Math.round(this.revenueStats.averageOrderValue).toLocaleString() + ' TND',
        label: 'Panier moyen',
        subLabel: `${this.orderStats.totalOrders} commandes totales`,
        color: 'info',
        bgColor: 'linear-gradient(135deg, #3b82f6, #2563eb)'
      }
    ];
  }

  getRecentActivities(): any[] {
    const activities: any[] = [];
    
    if (this.pendingDoctors.length > 0) {
      activities.push({
        icon: 'bi bi-person-badge',
        description: `${this.pendingDoctors.length} médecin(s) en attente de certification`,
        time: 'Nouveau',
        color: 'warning'
      });
    }
    
    if (this.pendingNutritionists.length > 0) {
      activities.push({
        icon: 'bi bi-apple',
        description: `${this.pendingNutritionists.length} nutritionniste(s) en attente de certification`,
        time: 'Nouveau',
        color: 'warning'
      });
    }
    
    if (this.orderStats.pendingOrders > 0) {
      activities.push({
        icon: 'bi bi-cart',
        description: `${this.orderStats.pendingOrders} commande(s) en attente de traitement`,
        time: 'À traiter',
        color: 'info'
      });
    }
    
    if (this.orderStats.deliveredOrders > 0) {
      activities.push({
        icon: 'bi bi-check-circle',
        description: `${this.orderStats.deliveredOrders} commande(s) livrée(s) avec succès`,
        time: 'Terminé',
        color: 'success'
      });
    }
    
    return activities;
  }

  getWeekNumber(date: Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  }

  refreshData(): void {
    console.log('🔄 Rafraîchissement des données...');
    this.loadAllData();
  }

  viewCertificate(professional: any, type: string): void {
    if (professional.certificateImage) {
      window.open(`http://localhost:8081${professional.certificateImage}`, '_blank');
    } else {
      const name = type === 'doctor' ? `Dr. ${professional.firstName} ${professional.lastName}` : `${professional.firstName} ${professional.lastName}`;
      alert(`Certificat de ${name}`);
    }
  }

  approveDoctor(doctor: any): void {
    if (confirm(`Approuver le Dr. ${doctor.firstName} ${doctor.lastName} ?`)) {
      this.adminDataService.approveDoctor(doctor.id).subscribe({
        next: () => {
          alert(`✅ Dr. ${doctor.firstName} ${doctor.lastName} a été approuvé !`);
          this.pendingDoctors = this.pendingDoctors.filter(d => d.id !== doctor.id);
          this.updateUserStats();
        },
        error: (err: any) => {
          console.error('Erreur:', err);
          alert('❌ Erreur lors de l\'approbation');
        }
      });
    }
  }

  rejectDoctor(doctor: any): void {
    if (confirm(`Refuser le Dr. ${doctor.firstName} ${doctor.lastName} ?`)) {
      this.adminDataService.rejectDoctor(doctor.id).subscribe({
        next: () => {
          alert(`❌ Dr. ${doctor.firstName} ${doctor.lastName} a été refusé.`);
          this.pendingDoctors = this.pendingDoctors.filter(d => d.id !== doctor.id);
          this.updateUserStats();
        },
        error: (err: any) => {
          console.error('Erreur:', err);
          alert('❌ Erreur lors du refus');
        }
      });
    }
  }

  approveNutritionist(nutritionist: any): void {
    if (confirm(`Approuver ${nutritionist.firstName} ${nutritionist.lastName} ?`)) {
      this.adminDataService.approveNutritionist(nutritionist.id).subscribe({
        next: () => {
          alert(`✅ ${nutritionist.firstName} ${nutritionist.lastName} a été approuvé !`);
          this.pendingNutritionists = this.pendingNutritionists.filter(n => n.id !== nutritionist.id);
          this.updateUserStats();
        },
        error: (err: any) => {
          console.error('Erreur:', err);
          alert('❌ Erreur lors de l\'approbation');
        }
      });
    }
  }

  rejectNutritionist(nutritionist: any): void {
    if (confirm(`Refuser ${nutritionist.firstName} ${nutritionist.lastName} ?`)) {
      this.adminDataService.rejectNutritionist(nutritionist.id).subscribe({
        next: () => {
          alert(`❌ ${nutritionist.firstName} ${nutritionist.lastName} a été refusé.`);
          this.pendingNutritionists = this.pendingNutritionists.filter(n => n.id !== nutritionist.id);
          this.updateUserStats();
        },
        error: (err: any) => {
          console.error('Erreur:', err);
          alert('❌ Erreur lors du refus');
        }
      });
    }
  }

  getWaitingDays(createdAt: string): number {
    if (!createdAt) return 0;
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getSpecialtyLabel(specialty: string): string {
    const specialties: {[key: string]: string} = {
      'ENDOCRINOLOGIST': 'Endocrinologue',
      'DIABETOLOGIST': 'Diabétologue',
      'NUTRITIONIST': 'Nutritionniste',
      'GENERALIST': 'Généraliste'
    };
    return specialties[specialty] || specialty || 'Médecin';
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'DELIVERED': 'Livrée',
      'LIVREE': 'Livrée',
      'CONFIRMED': 'Confirmée',
      'PREPARING': 'Préparation',
      'SHIPPED': 'Expédiée',
      'OUT_FOR_DELIVERY': 'En livraison',
      'CANCELLED': 'Annulée'
    };
    return statusMap[status] || status;
  }

  getBadgeClass(status: string): string {
    const normalizedStatus = (status || '').toUpperCase();
    switch(normalizedStatus) {
      case 'DELIVERED':
      case 'LIVREE':
        return 'success';
      case 'CANCELLED':
        return 'danger';
      case 'OUT_FOR_DELIVERY':
      case 'EN LIVRAISON':
        return 'info';
      case 'SHIPPED':
        return 'primary';
      case 'PREPARING':
      case 'PRÉPARATION':
        return 'warning';
      case 'CONFIRMED':
      case 'CONFIRMÉE':
        return 'secondary';
      default:
        return 'secondary';
    }
  }
}