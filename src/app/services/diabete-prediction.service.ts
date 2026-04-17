import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DiabetesPredictionRequest {
  Age: number;
  Gender: number;
  Polyuria: number;
  Polydipsia: number;
  sudden_weight_loss: number;
  weakness: number;
  Polyphagia: number;
  Genital_thrush: number;
  visual_blurring: number;
  Itching: number;
  Irritability: number;
  delayed_healing: number;
  partial_paresis: number;
  muscle_stiffness: number;
  Alopecia: number;
  Obesity: number;
}

export interface DiabetesPredictionResponse {
  prediction: number;
  result: string;
  probability: number;
  riskLevel: string;
  recommendations: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DiabetePredictionService {
  private apiUrl = 'http://localhost:8081/api/diabetes-prediction';

  constructor(private http: HttpClient) { }

  predict(data: DiabetesPredictionRequest): Observable<DiabetesPredictionResponse> {
    return this.http.post<DiabetesPredictionResponse>(`${this.apiUrl}/predict`, data);
  }

  getInfo(): Observable<any> {
    return this.http.get(`${this.apiUrl}/info`);
  }
}