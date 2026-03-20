import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FoodAnalysisResult {
  foods: FoodItem[];
  rawText: string;
  analysisDate?: string;
}

export interface FoodItem {
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
  sugar?: number;
}

export interface FoodEntry {
  id?: number;
  text: string;
  analysisResult?: string;
  patientId?: number;
  createdAt?: string;
  parsedResult?: FoodAnalysisResult;
}

export interface DietMeal {
  id?: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food: string;
  calories?: number;
  notes?: string;
}

export interface DietPlan {
  id?: number;
  title: string;
  description: string;
  patientId: number;
  nutritionistId?: number;
  meals?: DietMeal[];
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NutritionService {
  private apiUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

private getHeaders(): HttpHeaders {
  let token = '';
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token') || '';
  }
  return new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });
}

  // ─── PATIENT: Food Tracking ───────────────────────────────────────────────

  /**
   * POST /api/food
   * Patient submits text → Spring calls Flask ML → returns food analysis
   */
  analyzeFood(text: string, patientId: number): Observable<FoodEntry> {
    return this.http.post<FoodEntry>(
      `${this.apiUrl}/foods`,
      { text, patientId },
      { headers: this.getHeaders() }
    );
  }

  /**
   * GET /api/food
   * Get all food entries for the logged-in patient
   */
  getFoodHistory(): Observable<FoodEntry[]> {
    return this.http.get<FoodEntry[]>(
      `${this.apiUrl}/foods`,
      { headers: this.getHeaders() }
    );
  }

  // ─── PATIENT: Diet Plans ──────────────────────────────────────────────────

  /**
   * GET /api/diet/patient/:id
   * Patient retrieves their assigned diet plans
   */
  getPatientDietPlans(patientId: number): Observable<DietPlan[]> {
    return this.http.get<DietPlan[]>(
      `${this.apiUrl}/diet/patient/${patientId}`,
      { headers: this.getHeaders() }
    );
  }

  // ─── NUTRITIONIST: Plan Management ───────────────────────────────────────

  /**
   * POST /api/diet/create
   * Nutritionist creates a new diet plan for a patient
   */
  createDietPlan(plan: DietPlan): Observable<DietPlan> {
    return this.http.post<DietPlan>(
      `${this.apiUrl}/diet/create`,
      plan,
      { headers: this.getHeaders() }
    );
  }

  /**
   * POST /api/diet/add-meal
   * Add a meal to an existing diet plan
   */
  addMealToPlan(dietPlanId: number, meal: DietMeal): Observable<DietPlan> {
    return this.http.post<DietPlan>(
      `${this.apiUrl}/diet/add-meal`,
      { dietPlanId, ...meal },
      { headers: this.getHeaders() }
    );
  }

  /**
   * GET /api/diet/all  (to implement in backend if needed)
   * Nutritionist retrieves all plans they created
   */
  getNutritionistPlans(): Observable<DietPlan[]> {
    return this.http.get<DietPlan[]>(
      `${this.apiUrl}/diet/my-plans`,
      { headers: this.getHeaders() }
    );
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────

  /**
   * Parse the JSON string stored in FoodEntry.analysisResult
   */
 parseAnalysisResult(entry: FoodEntry): FoodAnalysisResult | null {
  try {
    if (!entry.analysisResult) return null;
    const raw = JSON.parse(entry.analysisResult);

    // Flask retourne "foods_detected" → on mappe vers "foods"
    const foods: FoodItem[] = (raw.foods_detected || []).map((f: any) => ({
      name: f.food,           // "food" → "name"
      calories: f.calories,
      carbs: f.carbs,
      protein: f.protein,
      fat: f.fat,
      fiber: f.fibre,         // "fibre" → "fiber"
    }));

    return {
      foods,
      rawText: raw.text || entry.text
    };
  } catch {
    return null;
  }
}

  getMealTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      breakfast: '🌅 Petit-déjeuner',
      lunch: '☀️ Déjeuner',
      dinner: '🌙 Dîner',
      snack: '🍎 Collation'
    };
    return labels[type] || type;
  }

  /**
   * Calculate total macros for a food analysis
   */
  getTotals(foods: FoodItem[]): FoodItem {
    return foods.reduce((acc, f) => ({
      name: 'Total',
      calories: acc.calories + (f.calories || 0),
      carbs: acc.carbs + (f.carbs || 0),
      protein: acc.protein + (f.protein || 0),
      fat: acc.fat + (f.fat || 0),
      fiber: acc.fiber + (f.fiber || 0),
    }), { name: 'Total', calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0 });
  }
}