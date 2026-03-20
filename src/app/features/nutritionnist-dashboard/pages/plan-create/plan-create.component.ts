// plan-create.component.ts
import { Component, OnInit } from '@angular/core';
import { NutritionService, DietPlan, DietMeal } from '../../../../services/nutrition.service';

interface PatientOption {
  id: number;
  name: string;
  diabetesType?: string;
}

@Component({
  selector: 'app-plan-create',
  templateUrl: './plan-create.component.html',
  styleUrls: ['./plan-create.component.css']
})
export class PlanCreateComponent implements OnInit {

  step = 1;

  patients: PatientOption[] = [];
  selectedPatient: PatientOption | null = null;

  planForm = {
    title: '',
    description: ''
  };

  createdPlan: DietPlan | null = null;

  mealForm = {
    mealType: 'breakfast' as DietMeal['mealType'],
    food: '',
    calories: null as number | null,
    notes: ''
  };

  addedMeals: DietMeal[] = [];
  isLoadingPatients = false;
  isSavingPlan = false;
  isAddingMeal = false;
  errorMsg = '';

  // TODO: nutritionistId — remplacer par user.id quand AuthService sera prêt
  // const user = JSON.parse(localStorage.getItem('user') || '{}');
  // nutritionistId = user.id;
  nutritionistId: number = 1;

  mealTypes: Array<{ value: DietMeal['mealType']; label: string }> = [
    { value: 'breakfast', label: '🌅 Petit-déjeuner' },
    { value: 'lunch',     label: '☀️ Déjeuner'       },
    { value: 'dinner',    label: '🌙 Dîner'           },
    { value: 'snack',     label: '🍎 Collation'       }
  ];

  constructor(
    private nutritionService: NutritionService
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoadingPatients = true;
    // TODO: remplacer par un vrai appel API quand UserService sera prêt
    // this.userService.getPatients().subscribe({ ... })
    // Pour l'instant mock statique
    this.patients = [
      { id: 1, name: 'Ahmed Ben Ali',  diabetesType: 'Type 2' },
      { id: 2, name: 'Fatima Zahra',   diabetesType: 'Type 1' },
      { id: 3, name: 'Mohamed Salah',  diabetesType: 'Type 2' },
    ];
    this.isLoadingPatients = false;
  }

  selectPatient(patient: PatientOption): void {
    this.selectedPatient = patient;
  }

  goToStep2(): void {
    if (!this.selectedPatient) return;
    this.step = 2;
  }

  createPlan(): void {
    if (!this.planForm.title || !this.selectedPatient) return;
    this.isSavingPlan = true;
    this.errorMsg = '';

    const plan: DietPlan = {
      title: this.planForm.title,
      description: this.planForm.description,
      patientId: this.selectedPatient.id,
      nutritionistId: this.nutritionistId
    };

    this.nutritionService.createDietPlan(plan).subscribe({
      next: (created) => {
        this.createdPlan = created;
        this.isSavingPlan = false;
        this.step = 3;
      },
      error: () => {
        this.errorMsg = 'Erreur lors de la création du plan.';
        this.isSavingPlan = false;
      }
    });
  }

  addMeal(): void {
    if (!this.mealForm.food || !this.createdPlan?.id) return;
    this.isAddingMeal = true;

    const meal: DietMeal = {
      mealType: this.mealForm.mealType,
      food: this.mealForm.food,
      calories: this.mealForm.calories || undefined,
      notes: this.mealForm.notes || undefined
    };

    this.nutritionService.addMealToPlan(this.createdPlan.id, meal).subscribe({
      next: () => {
        this.addedMeals.push({ ...meal });
        this.mealForm.food = '';
        this.mealForm.calories = null;
        this.mealForm.notes = '';
        this.isAddingMeal = false;
      },
      error: () => {
        this.errorMsg = "Erreur lors de l'ajout du repas.";
        this.isAddingMeal = false;
      }
    });
  }

  removeMealLocally(index: number): void {
    this.addedMeals.splice(index, 1);
  }

  finalize(): void {
    this.step = 4;
  }

  resetAll(): void {
    this.step = 1;
    this.selectedPatient = null;
    this.planForm = { title: '', description: '' };
    this.createdPlan = null;
    this.addedMeals = [];
    this.mealForm = { mealType: 'breakfast', food: '', calories: null, notes: '' };
    this.errorMsg = '';
  }

  getMealTypeLabel(type: string): string {
    return this.nutritionService.getMealTypeLabel(type);
  }
}