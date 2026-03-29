import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminDataService {

  private base = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  // ===== DOCTORS =====
  getAllDoctors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/doctors/all`);
  }

  getAllDoctorsByStatus(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/doctors/status/${status}`);
  }

  approveDoctor(id: number): Observable<any> {
    return this.http.put(`${this.base}/doctors/certificate/approve/${id}`, {});
  }

  rejectDoctor(id: number): Observable<any> {
    return this.http.put(`${this.base}/doctors/certificate/reject/${id}`, {});
  }

  // ===== NUTRITIONISTS =====
  getAllNutritionists(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/nutritionists/all`);
  }

  getAllNutritionistsByStatus(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/nutritionists/status/${status}`);
  }

  approveNutritionist(id: number): Observable<any> {
    return this.http.put(`${this.base}/nutritionists/certificate/approve/${id}`, {});
  }

  rejectNutritionist(id: number): Observable<any> {
    return this.http.put(`${this.base}/nutritionists/certificate/reject/${id}`, {});
  }

  // ===== PATIENTS =====
  getAllPatients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/patients/all`);
  }

  // ===== COUNTS =====
  getPendingDoctorsCount(): Observable<number> {
    return this.http.get<number>(`${this.base}/doctors/pending/count`);
  }

  getPendingNutritionistsCount(): Observable<number> {
    return this.http.get<number>(`${this.base}/nutritionists/pending/count`);
  }
}