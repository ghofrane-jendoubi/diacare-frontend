import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentDate = new Date();
  selectedPeriod = 'week';

  statistics = [
    {
      icon: 'bi bi-people-fill',
      value: '1,234',
      label: 'Patients Actifs',
      bgColor: 'linear-gradient(135deg, #4158D0, #C850C0)',
      trend: 12
    },
    {
      icon: 'bi bi-person-badge-fill',
      value: '48',
      label: 'Medecins',
      bgColor: 'linear-gradient(135deg, #FF512F, #DD2476)',
      trend: 5
    },
    {
      icon: 'bi bi-calendar-check-fill',
      value: '156',
      label: 'Rendez-vous Aujourd\'hui',
      bgColor: 'linear-gradient(135deg, #11998e, #38ef7d)',
      trend: -3
    },
    {
      icon: 'bi bi-cart-check-fill',
      value: '45,678 MAD',
      label: 'Revenus du Mois',
      bgColor: 'linear-gradient(135deg, #F09819, #FF512F)',
      trend: 23
    }
  ];

  pendingDoctors = [
    {
      name: 'Ahmed Benani',
      specialty: 'Endocrinologue',
      certId: 'CERT-2024-001',
      waitingDays: 2
    },
    {
      name: 'Fatima Zahra',
      specialty: 'Nutritionniste',
      certId: 'CERT-2024-002',
      waitingDays: 1
    },
    {
      name: 'Youssef Benali',
      specialty: 'Diabetologue',
      certId: 'CERT-2024-003',
      waitingDays: 3
    }
  ];

  weeklyConsultations = [65, 72, 80, 78, 85, 90, 88];
  weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  maxConsultation = Math.max(...this.weeklyConsultations);

  recentActivities = [
    {
      type: 'consultation',
      icon: 'bi bi-camera-video-fill',
      description: 'Consultation en ligne: Dr. Karim avec Patient #1234',
      time: 'Il y a 5 minutes',
      color: 'primary'
    },
    {
      type: 'payment',
      icon: 'bi bi-credit-card',
      description: 'Paiement recu: 250 MAD pour consultation',
      time: 'Il y a 15 minutes',
      color: 'success'
    },
    {
      type: 'document',
      icon: 'bi bi-file-earmark-pdf-fill',
      description: 'Nouveau document educatif: "Guide du diabete"',
      time: 'Il y a 30 minutes',
      color: 'warning'
    },
    {
      type: 'appointment',
      icon: 'bi bi-calendar-check',
      description: 'Rendez-vous programme pour patient #5678',
      time: 'Il y a 1 heure',
      color: 'info'
    }
  ];

  recentOrders = [
    {
      id: 'ORD-001',
      patientName: 'Mohamed Alami',
      productCount: 3,
      amount: 560,
      status: 'pending',
      date: '2024-02-24'
    },
    {
      id: 'ORD-002',
      patientName: 'Sara Benjelloun',
      productCount: 2,
      amount: 320,
      status: 'delivered',
      date: '2024-02-23'
    },
    {
      id: 'ORD-003',
      patientName: 'Hassan El Fassi',
      productCount: 2,
      amount: 400,
      status: 'processing',
      date: '2024-02-22'
    }
  ];

  nearbyDoctors = 12;
  nearbyPharmacies = 8;
  nearbyHospitals = 3;

  ngOnInit(): void {
    // Dashboard standard, sans bloc emotions
  }

  refreshData(): void {
    console.log('Rafraichissement des donnees...');
  }

  viewCertificate(doctor: any): void {
    alert(`Visualisation du certificat de Dr. ${doctor.name}`);
  }

  approveDoctor(doctor: any): void {
    alert(`Dr. ${doctor.name} a ete approuve avec succes !`);
  }

  rejectDoctor(doctor: any): void {
    alert(`Dr. ${doctor.name} a ete refuse.`);
  }

  viewOrder(order: any): void {
    alert(`Details de la commande #${order.id}`);
  }

  updateOrderStatus(order: any): void {
    alert(`Mise a jour du statut de la commande #${order.id}`);
  }

  getOrderStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'En attente',
      processing: 'En traitement',
      shipped: 'Expediee',
      delivered: 'Livree',
      cancelled: 'Annulee'
    };
    return statusMap[status] || status;
  }
}
