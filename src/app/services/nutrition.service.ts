import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DietPlan, DietMeal, FoodItem, FoodEntry, FoodAnalysisResult, Patient } from '../models/diet-plan.model';

// Interface pour la réponse d'analyse d'image
export interface ImageAnalysisResponse {
  entry?: FoodEntry;
  detected_foods?: string[];
  provider?: string;
  need_manual_input?: boolean;
  message?: string;
  error?: string;
}

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

  // ==================== FOOD TRACKING ====================

  /**
   * Analyse un texte via le ML Flask
   */
  analyzeFood(text: string, patientId: number): Observable<FoodEntry> {
    return this.http.post<FoodEntry>(
      `${this.apiUrl}/foods`,
      { text, patientId },
      { headers: this.getHeaders() }
    );
  }

  /**
   * Analyse une image via le backend Spring
   * Retourne soit:
   * - need_manual_input: true si besoin de description manuelle
   * - detected_foods: liste des aliments détectés
   * - entry: l'entrée sauvegardée (si déjà analysée)
   */
  analyzeFoodImage(base64: string, patientId: number): Observable<ImageAnalysisResponse> {
    return this.http.post<ImageAnalysisResponse>(
      `${this.apiUrl}/foods/analyze-image`,
      { image: base64, patientId },
      { headers: this.getHeaders() }
    );
  }

  /**
   * Récupère tout l'historique (admin/nutritionniste)
   */
  getFoodHistory(): Observable<FoodEntry[]> {
    return this.http.get<FoodEntry[]>(`${this.apiUrl}/foods`, { headers: this.getHeaders() });
  }

  /**
   * Récupère l'historique d'un patient spécifique
   */
  getFoodHistoryByPatient(patientId: number): Observable<FoodEntry[]> {
    return this.http.get<FoodEntry[]>(`${this.apiUrl}/foods/patient/${patientId}`, { headers: this.getHeaders() });
  }

  /**
   * Récupère les entrées d'aujourd'hui pour un patient
   */
  getTodayFoodEntries(patientId: number): Observable<FoodEntry[]> {
    return this.http.get<FoodEntry[]>(`${this.apiUrl}/foods/patient/${patientId}/today`, { headers: this.getHeaders() });
  }

  /**
   * Supprime une entrée
   */
  deleteFoodEntry(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/foods/${id}`,
      { headers: this.getHeaders() }
    );
  }

  // ==================== NUTRITION PROFILE ====================

  getNutritionProfile(patientId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/nutrition-profile/patient/${patientId}`, { headers: this.getHeaders() });
  }

  saveNutritionProfile(profile: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/nutrition-profile`, profile, { headers: this.getHeaders() });
  }

  deleteNutritionProfile(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/nutrition-profile/${id}`, { headers: this.getHeaders() });
  }

  // ==================== DIET PLANS ====================

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

  // ==================== PATIENT MANAGEMENT ====================

  getAllPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.apiUrl}/nutritionist/patients`, { headers: this.getHeaders() });
  }

  getPatientById(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/nutritionist/patients/${id}`, { headers: this.getHeaders() });
  }

  // ==================== HELPERS ====================

  /**
   * Parse le résultat JSON retourné par Flask
   */
  parseAnalysisResult(entry: FoodEntry): FoodAnalysisResult | null {
    try {
      if (!entry.analysisResult) return null;

      const raw = JSON.parse(entry.analysisResult.trim());

      const foods: FoodItem[] = (raw.foods_detected || []).map((f: any) => ({
        name:     f.food,
        calories: f.calories,
        carbs:    f.carbs,
        protein:  f.protein,
        fat:      f.fat,
        fiber:    f.fibre || 0,
      }));

      return { 
        foods, 
        rawText: raw.text || entry.text,
        analysisDate: entry.createdAt
      };
    } catch (e) {
      console.error('parseAnalysisResult error:', e);
      return null;
    }
  }

  /**
   * Calcule le total des macros à partir d'une liste d'aliments
   */
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

  /**
   * Retourne le label du type de repas
   */
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
   * Retourne la classe CSS pour l'IMC
   */
  getBMIClass(bmi: number): string {
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overweight';
    return 'obese';
  }

  /**
   * Retourne le label pour l'IMC
   */
  getBMILabel(bmi: number): string {
    if (bmi < 18.5) return 'Insuffisance pondérale';
    if (bmi < 25) return 'Poids normal';
    if (bmi < 30) return 'Surpoids';
    return 'Obésité';
  }
}