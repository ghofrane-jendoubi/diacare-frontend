import { Component } from '@angular/core';

@Component({
  selector: 'app-nutritionnist-dashboard',
  templateUrl: './nutritionnist-dashboard.component.html',
  styleUrls: ['./nutritionnist-dashboard.component.css']
})
export class NutritionnistDashboardComponent {
  currentDate = new Date();
  selectedPeriod = 'week';

  // Statistiques avec thème vert
  statistics = [
    { 
      icon: 'bi bi-people-fill', 
      value: '156', 
      label: 'Patients Suivis',
      bgColor: 'linear-gradient(135deg, #2ecc71, #27ae60)',
      trend: 8
    },
    { 
      icon: 'bi bi-calendar-check-fill', 
      value: '24', 
      label: 'Consultations Cette Semaine',
      bgColor: 'linear-gradient(135deg, #3498db, #2980b9)',
      trend: 12
    },
    { 
      icon: 'bi bi-basket-fill', 
      value: '38', 
      label: 'Plans Alimentaires',
      bgColor: 'linear-gradient(135deg, #f1c40f, #f39c12)',
      trend: 5
    },
    { 
      icon: 'bi bi-graph-up', 
      value: '82%', 
      label: 'Taux de Réussite',
      bgColor: 'linear-gradient(135deg, #e74c3c, #c0392b)',
      trend: 15
    }
  ];

  // Patients récents
  recentPatients = [
    {
      name: 'Sophie Martin',
      age: 45,
      diabetesType: 'Type 2',
      lastVisit: '2024-02-24',
      nextAppointment: '2024-03-10',
      avatar: 'assets/images/patients/patient1.jpg',
      status: 'active'
    },
    {
      name: 'Ahmed Benani',
      age: 52,
      diabetesType: 'Type 2',
      lastVisit: '2024-02-23',
      nextAppointment: '2024-03-05',
      avatar: 'assets/images/patients/patient2.jpg',
      status: 'warning'
    },
    {
      name: 'Fatima Zahra',
      age: 38,
      diabetesType: 'Type 1',
      lastVisit: '2024-02-22',
      nextAppointment: '2024-03-12',
      avatar: 'assets/images/patients/patient3.jpg',
      status: 'success'
    },
    {
      name: 'Youssef Alami',
      age: 60,
      diabetesType: 'Type 2',
      lastVisit: '2024-02-21',
      nextAppointment: '2024-03-08',
      avatar: 'assets/images/patients/patient4.jpg',
      status: 'active'
    }
  ];

  // Plans alimentaires récents
  recentMealPlans = [
    {
      patientName: 'Sophie Martin',
      planName: 'Plan Équilibre Diabète',
      calories: 1800,
      carbs: 180,
      protein: 90,
      fat: 50,
      status: 'compliant',
      date: '2024-02-24'
    },
    {
      patientName: 'Ahmed Benani',
      planName: 'Plan Contrôle Glycémique',
      calories: 1600,
      carbs: 150,
      protein: 85,
      fat: 45,
      status: 'warning',
      date: '2024-02-23'
    },
    {
      patientName: 'Fatima Zahra',
      planName: 'Plan Ado Diabétique',
      calories: 2000,
      carbs: 220,
      protein: 95,
      fat: 55,
      status: 'success',
      date: '2024-02-22'
    }
  ];

  // Consultations à venir
  upcomingConsultations = [
    {
      patientName: 'Sophie Martin',
      time: '09:30',
      type: 'Suivi Mensuel',
      duration: 45,
      preparation: 'Analyses sanguines'
    },
    {
      patientName: 'Ahmed Benani',
      time: '11:00',
      type: 'Nouveau Plan Alimentaire',
      duration: 60,
      preparation: 'Journal alimentaire'
    },
    {
      patientName: 'Fatima Zahra',
      time: '14:30',
      type: 'Éducation Thérapeutique',
      duration: 30,
      preparation: 'Questions préparées'
    },
    {
      patientName: 'Youssef Alami',
      time: '16:00',
      type: 'Suivi Hebdomadaire',
      duration: 30,
      preparation: 'Glycémies'
    }
  ];

  // Alertes nutritionnelles
  nutritionAlerts = [
    {
      patientName: 'Ahmed Benani',
      alert: 'Glycémie élevée cette semaine',
      severity: 'warning',
      value: '1.80 g/L',
      recommendations: 'Réduire glucides rapides'
    },
    {
      patientName: 'Fatima Zahra',
      alert: 'Non-respect du plan alimentaire',
      severity: 'danger',
      value: '3 écarts',
      recommendations: 'Rappel des consignes'
    },
    {
      patientName: 'Sophie Martin',
      alert: 'Excellent suivi',
      severity: 'success',
      value: 'Objectifs atteints',
      recommendations: 'Maintenir'
    }
  ];

  // Conseils du jour
  dailyTips = [
    'Privilégier les aliments à index glycémique bas',
    'Boire au moins 1.5L d\'eau par jour',
    'Fractionner les repas en 3 principaux + 2 collations',
    'Pratiquer 30 minutes d\'activité physique par jour'
  ];

  // Statistiques nutritionnelles
  nutritionStats = {
    averageCalories: 1750,
    averageCarbs: 165,
    averageProtein: 82,
    averageFat: 48,
    compliantPatients: 68,
    totalPatients: 92
  };

  // Données pour le graphique
  weeklyGlucoseData = [
    { day: 'Lun', value: 1.2 },
    { day: 'Mar', value: 1.3 },
    { day: 'Mer', value: 1.1 },
    { day: 'Jeu', value: 1.4 },
    { day: 'Ven', value: 1.2 },
    { day: 'Sam', value: 1.5 },
    { day: 'Dim', value: 1.3 }
  ];
  maxGlucose = 1.8;

  constructor() { }

  // ✅ AJOUTER CETTE MÉTHODE
  refreshData() {
    console.log('Rafraîchissement des données...');
    // Vous pouvez ajouter une notification ou recharger les données
    alert('Données actualisées avec succès !');
  }

  viewPatient(patient: any) {
    alert(`Fiche patient: ${patient.name}`);
  }

  viewMealPlan(plan: any) {
    alert(`Plan alimentaire pour: ${plan.patientName}`);
  }

  startConsultation(consultation: any) {
    alert(`Démarrer consultation avec: ${consultation.patientName}`);
  }

  handleAlert(alert: any) {
    alert(`Traitement de l'alerte pour: ${alert.patientName}`);
  }

  getStatusClass(status: string): string {
    const classes = {
      'active': 'bg-success bg-opacity-10 text-success',
      'warning': 'bg-warning bg-opacity-10 text-warning',
      'success': 'bg-success bg-opacity-10 text-success',
      'danger': 'bg-danger bg-opacity-10 text-danger',
      'compliant': 'bg-success bg-opacity-10 text-success'
    };
    return classes[status as keyof typeof classes] || 'bg-secondary bg-opacity-10 text-secondary';
  }

  getSeverityIcon(severity: string): string {
    const icons = {
      'success': 'bi-check-circle-fill text-success',
      'warning': 'bi-exclamation-triangle-fill text-warning',
      'danger': 'bi-x-circle-fill text-danger'
    };
    return icons[severity as keyof typeof icons] || 'bi-info-circle-fill text-info';
  }
}