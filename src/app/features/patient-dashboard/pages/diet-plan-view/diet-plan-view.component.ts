// diet-plan-view.component.ts
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { NutritionService } from '../../../../services/nutrition.service';
import { DietPlan } from '../../../../models/diet-plan.model';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-diet-plan-view',
  templateUrl: './diet-plan-view.component.html',
  styleUrls: ['./diet-plan-view.component.css']
})
export class DietPlanViewComponent implements OnInit {
  plans: DietPlan[] = [];
  selectedPlan: DietPlan | null = null;
  isLoading = true;
  error = '';
  patientId: number | null = null;
  nutritionistId: number | null = null;  // ✅ Garder pour le filtrage
  patientName: string = '';

  mealOrder = ['breakfast', 'lunch', 'dinner', 'snack'];

  constructor(
    private nutritionService: NutritionService,
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadPatientInfo();
    }
  }

  loadPatientInfo(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.patientId = user.id;
      this.patientName = `${user.firstName} ${user.lastName}`;
      
      // ✅ Récupérer le nutritionniste sélectionné
      const nutritionistId = localStorage.getItem('selected_nutritionist_id');
      if (nutritionistId) {
        this.nutritionistId = parseInt(nutritionistId);
      }
      
      this.loadPlans();
    } else {
      this.error = 'Veuillez vous connecter';
      this.isLoading = false;
      setTimeout(() => this.router.navigate(['/auth/patient']), 2000);
    }
  }

  // diet-plan-view.component.ts
loadPlans(): void {
  if (!this.patientId) {
    this.isLoading = false;
    this.error = 'Patient non identifié';
    return;
  }
  
  this.isLoading = true;
  this.nutritionService.getPatientDietPlans(this.patientId).subscribe({
    next: (plans) => {
      console.log('📋 Tous les plans reçus:', plans);
      
      // ✅ Afficher toutes les clés du premier plan
      if (plans.length > 0) {
        console.log('🔑 Clés du premier plan:', Object.keys(plans[0]));
        console.log('📦 Plan complet:', JSON.stringify(plans[0], null, 2));
      }
      
      // ✅ Filtrer correctement
      if (this.nutritionistId && plans.length > 0) {
        // Essayer différentes possibilités
        this.plans = plans.filter(p => {
          const match = p.nutritionistId === this.nutritionistId || 
                       p.nutritionist?.id === this.nutritionistId ||
                       (p as any).nutritionist_id === this.nutritionistId;
          console.log(`Plan ${p.id}: match=${match}, nutritionistId=${p.nutritionistId}, nutritionist?.id=${p.nutritionist?.id}`);
          return match;
        });
        console.log(`📋 Plans filtrés pour nutritionniste ${this.nutritionistId}:`, this.plans);
      } else {
        this.plans = plans;
      }
      
      if (this.plans.length > 0) {
        this.selectedPlan = this.plans[0];
      }
      this.isLoading = false;
    },
    error: (err) => {
      console.error('❌ Erreur chargement plans:', err);
      this.error = 'Impossible de charger vos plans alimentaires.';
      this.isLoading = false;
    }
  });
}
  selectPlan(plan: DietPlan): void {
    this.selectedPlan = plan;
  }

  getMealTypeLabel(type: string): string {
    return this.nutritionService.getMealTypeLabel(type);
  }

  getMealsByType(plan: DietPlan, type: string) {
    return (plan.meals || []).filter(m => m.mealType === type);
  }

  hasMealsOfType(plan: DietPlan, type: string): boolean {
    return this.getMealsByType(plan, type).length > 0;
  }

  refreshPlans(): void {
    this.loadPlans();
  }
}