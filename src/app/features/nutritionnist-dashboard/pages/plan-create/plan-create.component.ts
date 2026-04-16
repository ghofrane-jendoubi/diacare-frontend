import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NutritionService } from '../../../../services/nutrition.service';

interface MealForm {
  mealType: string;
  food: string;
  targetCarbs: number | null;
  notes: string;
}

@Component({
  selector: 'app-plan-create',
  templateUrl: './plan-create.component.html',
  styleUrls: ['./plan-create.component.css']
})
export class PlanCreateComponent implements OnInit {

  // ── IDs ───────────────────────────────────────────────────
  patientId: number | null = null;
  nutritionistId: number | null = null;
  patientName: string = '';

  // ── Profil patient (pour afficher les besoins) ────────────
  patientProfile: any = null;

  // ── Formulaire plan ───────────────────────────────────────
  plan = {
    title:          '',
    description:    '',
    targetCalories: null as number | null,
    targetCarbs:    null as number | null,
    targetProtein:  null as number | null,
    targetFat:      null as number | null,
  };

  // ── Repas du plan ─────────────────────────────────────────
  meals: MealForm[] = [
    { mealType: 'breakfast', food: '', targetCarbs: null, notes: '' },
    { mealType: 'lunch',     food: '', targetCarbs: null, notes: '' },
    { mealType: 'dinner',    food: '', targetCarbs: null, notes: '' },
  ];

  mealTypes = [
    { value: 'breakfast', label: '🌅 Petit-déjeuner' },
    { value: 'lunch',     label: '☀️ Déjeuner'       },
    { value: 'dinner',    label: '🌙 Dîner'           },
    { value: 'snack',     label: '🍎 Collation'       },
  ];

  // ── UI ────────────────────────────────────────────────────
  isSaving    = false;
  savedSuccess = false;
  errorMsg    = '';
  activeStep  = 1;   // 1 = infos plan, 2 = repas, 3 = confirmation

  constructor(
    private route:            ActivatedRoute,
    private router:           Router,
    private nutritionService: NutritionService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // ✅ Charger l'ID du nutritionniste connecté
      this.loadNutritionistInfo();
      
      // ✅ Récupérer patientId depuis les paramètres de la route ou query params
      this.route.params.subscribe(params => {
        const patientIdFromUrl = params['patientId'] || params['id'];
        if (patientIdFromUrl) {
          this.patientId = +patientIdFromUrl;
          this.loadPatientInfo();
          this.loadPatientProfile();
        }
      });
      
      // Alternative: récupérer depuis queryParams
      this.route.queryParams.subscribe(params => {
        if (!this.patientId && params['patientId']) {
          this.patientId = +params['patientId'];
          this.loadPatientInfo();
          this.loadPatientProfile();
        }
      });
    }
  }

  // ✅ Charger les informations du nutritionniste connecté
  loadNutritionistInfo(): void {
    const nutritionistIdStr = localStorage.getItem('nutritionist_id');
    const firstName = localStorage.getItem('nutritionist_firstName');
    const lastName = localStorage.getItem('nutritionist_lastName');
    
    if (nutritionistIdStr) {
      this.nutritionistId = parseInt(nutritionistIdStr);
      console.log('✅ Nutritionniste connecté ID:', this.nutritionistId);
    } else {
      console.error('❌ Aucun nutritionniste connecté');
      setTimeout(() => {
        this.router.navigate(['/auth/nutritionist']);
      }, 2000);
    }
  }

  // ✅ Charger les informations de base du patient
  loadPatientInfo(): void {
    if (!this.patientId) return;
    
    this.nutritionService.getPatientInfo(this.patientId).subscribe({
      next: (patient) => {
        this.patientName = `${patient.firstName} ${patient.lastName}`;
        console.log('✅ Nom du patient chargé:', this.patientName);
      },
      error: (err: any) => {
        console.error('❌ Erreur chargement infos patient:', err);
        this.patientName = `Patient #${this.patientId}`;
      }
    });
  }

  // ── Charger profil patient pour afficher les targets ──────
  loadPatientProfile(): void {
    if (!this.patientId) return;
    
    this.nutritionService.getNutritionProfile(this.patientId).subscribe({
      next: (data) => {
        if (data?.id) {
          this.patientProfile = data;
          // Pré-remplir avec les targets du patient
          this.plan.targetCalories = data.targetCalories || null;
          this.plan.targetCarbs    = data.targetCarbs    || null;
          this.plan.targetProtein  = data.targetProtein  || null;
          this.plan.targetFat      = data.targetFat      || null;
          // Répartir les glucides par repas (3 repas principaux)
          if (data.targetCarbs) {
            this.meals[0].targetCarbs = Math.round(data.targetCarbs * 0.25);  // 25% matin
            this.meals[1].targetCarbs = Math.round(data.targetCarbs * 0.40);  // 40% midi
            this.meals[2].targetCarbs = Math.round(data.targetCarbs * 0.35);  // 35% soir
          }
        }
      },
      error: () => console.log('⚠️ Profil nutrition non disponible')
    });
  }

  getCarbsPercentage(): number {
    const total = this.getTotalCarbs();
    const target = this.plan.targetCarbs || 0;
    if (!target) return 0;
    const pct = (total / target) * 100;
    return Math.min(pct, 100);
  }

  // ── Gestion repas ─────────────────────────────────────────
  addMeal(): void {
    this.meals.push({ mealType: 'snack', food: '', targetCarbs: null, notes: '' });
  }

  removeMeal(index: number): void {
    if (this.meals.length > 1) {
      this.meals.splice(index, 1);
    }
  }

  // ── Totaux ────────────────────────────────────────────────
  getTotalCarbs(): number {
    return this.meals.reduce((sum, m) => sum + (m.targetCarbs || 0), 0);
  }

  getCarbsStatus(): string {
    const total  = this.getTotalCarbs();
    const target = this.plan.targetCarbs || 0;
    if (!target) return '';
    const pct = (total / target) * 100;
    if (pct > 110) return 'over';
    if (pct >= 90)  return 'ok';
    return 'under';
  }

  // ── Navigation steps ──────────────────────────────────────
  nextStep(): void {
    if (this.activeStep < 3) this.activeStep++;
  }

  prevStep(): void {
    if (this.activeStep > 1) this.activeStep--;
  }

  isStep1Valid(): boolean {
    return !!this.plan.title && !!this.plan.targetCalories && !!this.plan.targetCarbs;
  }

  isStep2Valid(): boolean {
    return this.meals.every(m => !!m.food);
  }

  // ── Soumettre le plan ─────────────────────────────────────
  savePlan(): void {
    if (!this.isStep1Valid() || !this.isStep2Valid()) return;
    if (!this.patientId || !this.nutritionistId) {
      this.errorMsg = 'Erreur: identifiants manquants';
      return;
    }

    this.isSaving = true;
    this.errorMsg = '';

    const payload = {
      patientId:      this.patientId,
      nutritionistId: this.nutritionistId,
      title:          this.plan.title,
      description:    this.plan.description,
      targetCalories: this.plan.targetCalories,
      targetCarbs:    this.plan.targetCarbs,
      targetProtein:  this.plan.targetProtein,
      targetFat:      this.plan.targetFat,
      meals: this.meals.map(m => ({
        mealType:    m.mealType,
        food:        m.food,
        targetCarbs: m.targetCarbs,
        notes:       m.notes
      }))
    };

    this.nutritionService.createDietPlan(payload as any).subscribe({
      next: () => {
        this.isSaving     = false;
        this.savedSuccess = true;
        setTimeout(() => {
          this.router.navigate(['/nutritionnist/patient', this.patientId]);
        }, 2000);
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMsg = 'Erreur lors de la création du plan. Veuillez réessayer.';
        console.error('❌ Erreur création plan:', err);
      }
    });
  }

  goBack(): void {
    if (this.patientId) {
      this.router.navigate(['/nutritionnist/patient', this.patientId]);
    } else {
      this.router.navigate(['/nutritionnist/patients']);
    }
  }

  getMealLabel(type: string): string {
    return this.mealTypes.find(m => m.value === type)?.label || type;
  }
}