// nutritionnist-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NutritionService } from '../../services/nutrition.service';
import { ChatNutritionService } from '../../services/chatnutrition.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-nutritionnist-dashboard',
  templateUrl: './nutritionnist-dashboard.component.html',
  styleUrls: ['./nutritionnist-dashboard.component.css']
})
export class NutritionnistDashboardComponent implements OnInit {
  currentDate = new Date();
  selectedPeriod = 'week';
  nutritionistId: number | null = null;
  isLoading = true;

  // Statistiques
  statistics = [
    { 
      icon: 'bi bi-people-fill', 
      value: '0', 
      label: 'Patients Suivis',
      bgColor: 'linear-gradient(135deg, #2ecc71, #27ae60)',
      trend: 0
    },
    { 
      icon: 'bi bi-basket-fill', 
      value: '0', 
      label: 'Plans Alimentaires',
      bgColor: 'linear-gradient(135deg, #f1c40f, #f39c12)',
      trend: 0
    },
    { 
      icon: 'bi bi-chat-dots-fill', 
      value: '0', 
      label: 'Messages Non Lus',
      bgColor: 'linear-gradient(135deg, #3498db, #2980b9)',
      trend: 0
    },
    { 
      icon: 'bi bi-exclamation-triangle-fill', 
      value: '0', 
      label: 'Alertes Actives',
      bgColor: 'linear-gradient(135deg, #e74c3c, #c0392b)',
      trend: 0
    }
  ];

  // Patients récents
  recentPatients: any[] = [];
  
  // Plans alimentaires récents
  recentMealPlans: any[] = [];
  
  // Consultations à venir
  upcomingConsultations: any[] = [];
  
  // Alertes nutritionnelles
  nutritionAlerts: any[] = [];
  
  // Conseils du jour
  dailyTips = [
    '🥗 Privilégier les aliments à index glycémique bas',
    '💧 Encourager une hydratation suffisante (1.5L/jour)',
    '🍽️ Fractionner les repas en 3 principaux + 2 collations',
    '🏃 Recommander 30 minutes d\'activité physique par jour',
    '📊 Suivre régulièrement la glycémie',
    '🍎 Manger des fruits entiers plutôt que des jus'
  ];

  // Données pour le graphique
  weeklyGlucoseData = [
    { day: 'Lun', value: 0 },
    { day: 'Mar', value: 0 },
    { day: 'Jeu', value: 0 },
    { day: 'Mer', value: 0 },
    { day: 'Ven', value: 0 },
    { day: 'Sam', value: 0 },
    { day: 'Dim', value: 0 }
  ];
  maxGlucose = 2.0;

  constructor(
    private nutritionService: NutritionService,
    private chatService: ChatNutritionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNutritionistInfo();
    this.loadDashboardData();
  }

  loadNutritionistInfo(): void {
    const user = this.authService.getCurrentUser();
    if (user && (user.role === 'NUTRITIONIST' || user.role === 'NUTRITIONNIST')) {
      this.nutritionistId = user.id;
    } else {
      const idStr = localStorage.getItem('nutritionist_id');
      if (idStr) {
        this.nutritionistId = parseInt(idStr);
      }
    }
    console.log('Nutritionniste ID:', this.nutritionistId);
  }

  loadDashboardData(): void {
    if (!this.nutritionistId) return;
    
    this.isLoading = true;
    
    // Charger les patients
    this.chatService.getNutritionistPatients(this.nutritionistId).subscribe({
      next: (patients) => {
        this.recentPatients = patients.slice(0, 5);
        this.statistics[0].value = patients.length.toString();
        this.statistics[0].trend = Math.floor(Math.random() * 20) + 1;
        this.loadPlans();
      },
      error: () => {
        this.loadMockPatients();
        this.loadPlans();
      }
    });
    
    // Charger les messages non lus
    this.chatService.countUnread(this.nutritionistId).subscribe({
      next: (count) => {
        this.statistics[2].value = count.toString();
      },
      error: () => {
        this.statistics[2].value = '0';
      }
    });
  }

  loadPlans(): void {
    // Récupérer les plans alimentaires
    this.nutritionService.getNutritionistPlans().subscribe({
      next: (plans) => {
        this.recentMealPlans = plans.slice(0, 3);
        this.statistics[1].value = plans.length.toString();
        this.statistics[1].trend = Math.floor(Math.random() * 15) + 1;
        this.isLoading = false;
      },
      error: () => {
        this.loadMockPlans();
        this.isLoading = false;
      }
    });
  }

  loadMockPatients(): void {
    this.recentPatients = [
      {
        id: 12,
        name: 'jendoubi ghofrane',
        firstName: 'ghofrane',
        lastName: 'jendoubi',
        age: 23,
        diabetesType: 'TYPE_1',
        lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        nextAppointment: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      },
      {
        id: 15,
        name: 'Sophie Martin',
        firstName: 'Sophie',
        lastName: 'Martin',
        age: 45,
        diabetesType: 'TYPE_2',
        lastVisit: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        nextAppointment: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'warning'
      }
    ];
    this.statistics[0].value = this.recentPatients.length.toString();
  }

  loadMockPlans(): void {
    this.recentMealPlans = [
      {
        patientName: 'ghofrane jendoubi',
        planName: 'Plan Équilibre Diabète Type 1',
        calories: 1886,
        carbs: 212,
        protein: 118,
        fat: 63,
        status: 'active',
        date: new Date().toISOString()
      }
    ];
    this.statistics[1].value = this.recentMealPlans.length.toString();
  }

  refreshData(): void {
    this.loadDashboardData();
    // Notification toast
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = '<i class="bi bi-check-circle-fill"></i> Données actualisées avec succès !';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  viewPatient(patient: any): void {
    this.router.navigate(['/nutritionnist/patient', patient.id]);
  }

  viewMealPlan(plan: any): void {
    if (plan.id) {
      this.router.navigate(['/nutritionnist/plan', plan.id]);
    }
  }

  startConsultation(consultation: any): void {
    this.router.navigate(['/nutritionnist/chat', consultation.patientId]);
  }

  handleAlert(alert: any): void {
    this.router.navigate(['/nutritionnist/patient', alert.patientId]);
  }

  createNewPlan(): void {
    this.router.navigate(['/nutritionnist/plans']);
  }

  getStatusClass(status: string): string {
    const classes: any = {
      'active': 'bg-success bg-opacity-10 text-success',
      'warning': 'bg-warning bg-opacity-10 text-warning',
      'success': 'bg-success bg-opacity-10 text-success',
      'danger': 'bg-danger bg-opacity-10 text-danger',
      'compliant': 'bg-success bg-opacity-10 text-success'
    };
    return classes[status] || 'bg-secondary bg-opacity-10 text-secondary';
  }

  getSeverityIcon(severity: string): string {
    const icons: any = {
      'success': 'bi-check-circle-fill text-success',
      'warning': 'bi-exclamation-triangle-fill text-warning',
      'danger': 'bi-x-circle-fill text-danger'
    };
    return icons[severity] || 'bi-info-circle-fill text-info';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  }
}