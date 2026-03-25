import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { NutritionService } from '../../services/nutrition.service';

@Component({
  selector: 'app-nutritionnist-dashboard',
  templateUrl: './nutritionnist-dashboard.component.html',
  styleUrls: ['./nutritionnist-dashboard.component.css']
})
export class NutritionnistDashboardComponent implements OnInit {

  currentDate = new Date();
  selectedPeriod = 'week';

  // ── Patient réel id=1 ─────────────────────────────────
  patientProfile: any = null;

  // Plans alimentaires — chargés depuis API
  recentMealPlans: any[] = [];

  // ── Données statiques (dashboard demo) ───────────────
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

  recentPatients = [
    {
      id: 1,
      name: 'Patient #1',
      age: '—',
      diabetesType: '—',
      lastVisit: new Date(),
      nextAppointment: new Date(),
      status: 'active'
    }
  ];

  upcomingConsultations = [
    { patientName: 'Patient #1', time: '09:30', type: 'Suivi Mensuel', duration: 45, preparation: 'Analyses sanguines' },
    { patientName: 'Patient #1', time: '11:00', type: 'Nouveau Plan Alimentaire', duration: 60, preparation: 'Journal alimentaire' }
  ];

  nutritionAlerts = [
    { patientName: 'Patient #1', alert: 'Glycémie élevée cette semaine', severity: 'warning', value: '1.80 g/L', recommendations: 'Réduire glucides rapides' },
    { patientName: 'Patient #1', alert: 'Excellent suivi', severity: 'success', value: 'Objectifs atteints', recommendations: 'Maintenir' }
  ];

  dailyTips = [
    'Privilégier les aliments à index glycémique bas',
    'Boire au moins 1.5L d\'eau par jour',
    'Fractionner les repas en 3 principaux + 2 collations',
    'Pratiquer 30 minutes d\'activité physique par jour'
  ];

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

  constructor(
    private router: Router,
    private nutritionService: NutritionService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadPatientProfile();
    }
  }

  // ── Charger profil réel du patient id=1 ──────────────
  loadPatientProfile(): void {
    this.nutritionService.getNutritionProfile(1).subscribe({
      next: (profile) => {
        if (profile?.id) {
          this.patientProfile = profile;

          // Calculer les besoins caloriques
          let dailyCalories = 1800;
          if (profile.weight && profile.height && profile.age) {
            let bmr = profile.gender === 'male'
              ? 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5
              : 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
            const multipliers: any = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
            dailyCalories = Math.round(bmr * (multipliers[profile.activityLevel] || 1.375));
          }

          const dailyCarbs = Math.round((dailyCalories * 0.45) / 4);
          const protein    = Math.round((dailyCalories * 0.25) / 4);
          const fat        = Math.round((dailyCalories * 0.30) / 9);

          // ← Remplacer les données statiques par le vrai patient
          this.recentMealPlans = [{
            patientId:   1,
            patientName: 'Patient #1',
            planName:    profile.diabetesType
                           ? `Plan ${profile.diabetesType}`
                           : 'Plan nutritionnel personnalisé',
            calories: dailyCalories,
            carbs:    dailyCarbs,
            protein:  protein,
            fat:      fat,
            status:   'compliant',
            date:     new Date()
          }];

          // Mettre à jour patient récent avec vraies données
          this.recentPatients = [{
            id:              1,
            name:            'Patient #1',
            age:             profile.age || '—',
            diabetesType:    profile.diabetesType || '—',
            lastVisit:       new Date(),
            nextAppointment: new Date(),
            status:          'active'
          }];
        }
      },
      error: () => {
        // Fallback si pas de profil
        this.recentMealPlans = [{
          patientId:   1,
          patientName: 'Patient #1',
          planName:    'Plan nutritionnel',
          calories:    1800,
          carbs:       180,
          protein:     90,
          fat:         60,
          status:      'compliant',
          date:        new Date()
        }];
      }
    });
  }

  // ── Navigation ────────────────────────────────────────

  // Bouton "Détails →" dans Plans alimentaires → patient-detail
  viewMealPlan(plan: any): void {
    this.router.navigate(['/nutritionnist/patient', plan.patientId || 1]);
  }

  // Bouton œil dans table patients → patient-detail
  viewPatient(patient: any): void {
    this.router.navigate(['/nutritionnist/patient', patient.id || 1]);
  }

  // ── Actions ───────────────────────────────────────────
  refreshData(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadPatientProfile();
    }
  }

  startConsultation(consultation: any): void {
    console.log('Consultation:', consultation.patientName);
  }

  handleAlert(alert: any): void {
    console.log('Alerte traitée:', alert.patientName);
  }

  getStatusClass(status: string): string {
    const classes: any = {
      'active':    'bg-success bg-opacity-10 text-success',
      'warning':   'bg-warning bg-opacity-10 text-warning',
      'success':   'bg-success bg-opacity-10 text-success',
      'danger':    'bg-danger bg-opacity-10 text-danger',
      'compliant': 'bg-success bg-opacity-10 text-success'
    };
    return classes[status] || 'bg-secondary bg-opacity-10 text-secondary';
  }

  getSeverityIcon(severity: string): string {
    const icons: any = {
      'success': 'bi-check-circle-fill text-success',
      'warning': 'bi-exclamation-triangle-fill text-warning',
      'danger':  'bi-x-circle-fill text-danger'
    };
    return icons[severity] || 'bi-info-circle-fill text-info';
  }
}