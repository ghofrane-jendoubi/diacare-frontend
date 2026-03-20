// diet-plan-view.component.ts
import { Component, OnInit } from '@angular/core';
import { NutritionService, DietPlan } from '../../../../services/nutrition.service';

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
  patientId: number = 1; // TODO: remplacer par user.id quand AuthService sera prêt
  // const user = JSON.parse(localStorage.getItem('user') || '{}');
  // this.patientId = user.id;

  mealOrder = ['breakfast', 'lunch', 'dinner', 'snack'];

  constructor(
    private nutritionService: NutritionService
  ) {}

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.isLoading = true;
    this.nutritionService.getPatientDietPlans(this.patientId).subscribe({
      next: (plans) => {
        this.plans = plans;
        if (plans.length > 0) this.selectedPlan = plans[0];
        this.isLoading = false;
      },
      error: () => {
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
}