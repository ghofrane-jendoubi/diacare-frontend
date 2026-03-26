import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DietPlan, DietMeal, FoodItem, FoodEntry, FoodAnalysisResult, Patient } from '../models/diet-plan.model';

@Injectable({
  providedIn: 'root'
})
export class NutritionService {
  private apiUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = (typeof window !== 'undefined') ? localStorage.getItem('token') || '' : '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ── PATIENT: Food Tracking ────────────────────────────────────────

  analyzeFood(text: string, patientId: number): Observable<FoodEntry> {
    return this.http.post<FoodEntry>(
      `${this.apiUrl}/foods`,
      { text, patientId },
      { headers: this.getHeaders() }
    );
  }

  analyzeFoodImage(base64: string, patientId: number): Observable<FoodEntry> {
    return this.http.post<FoodEntry>(
      `${this.apiUrl}/foods/analyze-image`,
      { image: base64, patientId },
      { headers: this.getHeaders() }
    );
  }

  getFoodHistory(): Observable<FoodEntry[]> {
    return this.http.get<FoodEntry[]>(`${this.apiUrl}/foods`, { headers: this.getHeaders() });
  }

  getFoodHistoryByPatient(patientId: number): Observable<FoodEntry[]> {
    return this.http.get<FoodEntry[]>(`${this.apiUrl}/foods/patient/${patientId}`, { headers: this.getHeaders() });
  }

  // ── NUTRITION PROFILE ───────────────────────────────────────────

  getNutritionProfile(patientId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/nutrition-profile/patient/${patientId}`, { headers: this.getHeaders() });
  }

  saveNutritionProfile(profile: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/nutrition-profile`, profile, { headers: this.getHeaders() });
  }

  deleteNutritionProfile(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/nutrition-profile/${id}`, { headers: this.getHeaders() });
  }

  // ── DIET PLANS ────────────────────────────────────────────────

  getPatientDietPlans(patientId: number): Observable<DietPlan[]> {
    return this.http.get<DietPlan[]>(`${this.apiUrl}/diet/patient/${patientId}`, { headers: this.getHeaders() });
  }

  createDietPlan(plan: DietPlan): Observable<DietPlan> {
    return this.http.post<DietPlan>(`${this.apiUrl}/diet/create`, plan, { headers: this.getHeaders() });
  }

  addMealToPlan(dietPlanId: number, meal: DietMeal): Observable<DietPlan> {
    return this.http.post<DietPlan>(`${this.apiUrl}/diet/add-meal`, { dietPlanId, ...meal }, { headers: this.getHeaders() });
  }

  getNutritionistPlans(): Observable<DietPlan[]> {
    return this.http.get<DietPlan[]>(`${this.apiUrl}/diet/my-plans`, { headers: this.getHeaders() });
  }

  // ── PATIENT MANAGEMENT (NUTRITIONIST) ──────────────────────────

  getAllPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.apiUrl}/nutritionist/patients`, { headers: this.getHeaders() });
  }

  getPatientById(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/nutritionist/patients/${id}`, { headers: this.getHeaders() });
  }

  // ── HELPERS ────────────────────────────────────────────────────

  parseAnalysisResult(entry: FoodEntry): FoodAnalysisResult | null {
    try {
      if (!entry.analysisResult) return null;
      const raw = JSON.parse(entry.analysisResult);
      const foods: FoodItem[] = (raw.foods_detected || []).map((f: any) => ({
        name: f.food,
        calories: f.calories,
        carbs: f.carbs,
        protein: f.protein,
        fat: f.fat,
        fiber: f.fibre,
      }));
      return { foods, rawText: raw.text || entry.text };
    } catch {
      return null;
    }
  }

  extractFoodsFromClarifai(response: any): string[] {
    const concepts = response?.outputs?.[0]?.data?.concepts || [];
    return concepts
      .filter((c: any) => c.value > 0.85)
      .map((c: any) => c.name)
      .slice(0, 5);
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

  getTotals(foods: FoodItem[] = []): FoodItem {
  return foods.reduce(
    (acc, f) => ({
      name: 'Total',
      calories: acc.calories + (f.calories || 0),
      carbs: acc.carbs + (f.carbs || 0),
      protein: acc.protein + (f.protein || 0),
      fat: acc.fat + (f.fat || 0),
      fiber: acc.fiber + (f.fiber || 0),
    }),
    { name: 'Total', calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0 }
  );
}

  getBMIClass(bmi: number): string {
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overweight';
    return 'obese';
  }

  getBMILabel(bmi: number): string {
    if (bmi < 18.5) return 'Insuffisance pondérale';
    if (bmi < 25) return 'Poids normal';
    if (bmi < 30) return 'Surpoids';
    return 'Obésité';
  }
}