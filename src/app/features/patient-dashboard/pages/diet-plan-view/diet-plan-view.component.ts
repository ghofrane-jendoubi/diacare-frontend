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
      this.loadPlans();
    }
  }

 loadPatientInfo(): void {
  const user = this.authService.getCurrentUser();
  
  if (user) {
    this.patientId = user.id;
    this.patientName = `${user.firstName} ${user.lastName}`;
    this.loadPlans();
  } else {
    this.error = 'Veuillez vous connecter';
    this.isLoading = false;
    setTimeout(() => this.router.navigate(['/auth/patient']), 2000);
  }
}

  loadPlans(): void {
    if (!this.patientId) {
      this.isLoading = false;
      this.error = 'Patient non identifié';
      return;
    }
    
    this.isLoading = true;
    this.nutritionService.getPatientDietPlans(this.patientId).subscribe({
      next: (plans) => {
        this.plans = plans;
        if (plans.length > 0) {
          this.selectedPlan = plans[0];
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

  // ✅ Méthode pour rafraîchir les plans
  refreshPlans(): void {
    this.loadPlans();
  }
}