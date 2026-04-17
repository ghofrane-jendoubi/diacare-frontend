import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  currentDate = new Date();
  selectedPeriod = 'week';

  // Statistiques
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
      label: 'Médecins',
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

  // Médecins en attente
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
      specialty: 'Diabétologue',
      certId: 'CERT-2024-003',
      waitingDays: 3
    }
  ];

  // Données pour les graphiques
  weeklyConsultations = [65, 72, 80, 78, 85, 90, 88];
  weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  maxConsultation = Math.max(...this.weeklyConsultations);

  // Activités récentes
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
      description: 'Paiement reçu: 250 MAD pour consultation',
      time: 'Il y a 15 minutes',
      color: 'success'
    },
    {
      type: 'document',
      icon: 'bi bi-file-earmark-pdf-fill',
      description: 'Nouveau document éducatif: "Guide du diabète"',
      time: 'Il y a 30 minutes',
      color: 'warning'
    },
    {
      type: 'appointment',
      icon: 'bi bi-calendar-check',
      description: 'Rendez-vous programmé pour patient #5678',
      time: 'Il y a 1 heure',
      color: 'info'
    }
  ];

  // Dans dashboard.component.ts

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

  // Statistiques de géolocalisation
  nearbyDoctors = 12;
  nearbyPharmacies = 8;
  nearbyHospitals = 3;

  constructor() { }

  refreshData() {
    console.log('Rafraîchissement des données...');
    // Ici vous pouvez ajouter la logique pour rafraîchir les données
  }

  viewCertificate(doctor: any) {
    alert(`Visualisation du certificat de Dr. ${doctor.name}`);
    // Logique pour afficher le certificat
  }

  approveDoctor(doctor: any) {
    alert(`Dr. ${doctor.name} a été approuvé avec succès !`);
    // Logique pour approuver le médecin
  }

  rejectDoctor(doctor: any) {
    alert(`Dr. ${doctor.name} a été refusé.`);
    // Logique pour refuser le médecin
  }

  viewOrder(order: any) {
    alert(`Détails de la commande #${order.id}`);
    // Logique pour voir les détails de la commande
  }

  updateOrderStatus(order: any) {
    alert(`Mise à jour du statut de la commande #${order.id}`);
    // Logique pour mettre à jour le statut
  }

  getOrderStatusText(status: string): string {
    const statusMap: {[key: string]: string} = {
      'pending': 'En attente',
      'processing': 'En traitement',
      'shipped': 'Expédiée',
      'delivered': 'Livrée',
      'cancelled': 'Annulée'
    };
    return statusMap[status] || status;
  }
}