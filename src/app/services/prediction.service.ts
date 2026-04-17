import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PredictionRequest {
  Pregnancies: number;
  Glucose: number;
  BloodPressure: number;
  SkinThickness: number;
  Insulin: number;
  BMI: number;
  DiabetesPedigreeFunction: number;
  Age: number;
}

export interface PredictionResult {
  success: boolean;
  result: {
    prediction: number;
    label: string;
    probability: number;
    probability_pct: number;
    risk_level: string;
    color: string;
    message: string;
    threshold_used: number;
    disclaimer: string;
  };
  features_used?: any;
  timestamp?: string;
  errors?: string[];
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  private apiUrl = 'http://localhost:8081/api/prediction';

  constructor(private http: HttpClient) { }

  predictDiabetes(data: PredictionRequest): Observable<PredictionResult> {
    return this.http.post<PredictionResult>(`${this.apiUrl}/diabetes`, data);
  }

  getModelInfo(): Observable<any> {
    return this.http.get(`${this.apiUrl}/info`);
  }
}