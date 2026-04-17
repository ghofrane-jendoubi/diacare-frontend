// patient-feedback.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, map } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PatientFeedback } from '../models/patient-feedback.model';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({ providedIn: 'root' })
export class PatientFeedbackService {
  private apiUrl = 'http://localhost:8081/api/doctor';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // ✅ Récupérer l'ID du docteur depuis l'Observable
  private getDoctorId(): Observable<number> {
    return this.authService.currentUser$.pipe(
      map(user => {
        // Utiliser l'ID directement
        if (user && user.id) {
          return user.id;
        }
        return 1; // Fallback ID
      })
    );
  }

  getPatientFeedbacks(): Observable<PatientFeedback[]> {
    return this.getDoctorId().pipe(
      switchMap(doctorId => {
        const params = new HttpParams().set('doctorId', String(doctorId));
        return this.http.get<PatientFeedback[]>(`${this.apiUrl}/patients/feedbacks`, { params }).pipe(
          switchMap((feedbacks) => {
            if (feedbacks.length > 0 || doctorId === 1) {
              return of(feedbacks);
            }
            const fallbackParams = new HttpParams().set('doctorId', '1');
            return this.http.get<PatientFeedback[]>(`${this.apiUrl}/patients/feedbacks`, { params: fallbackParams });
          })
        );
      })
    );
  }
}