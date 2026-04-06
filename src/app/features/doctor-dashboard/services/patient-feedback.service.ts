import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PatientFeedback } from '../models/patient-feedback.model';
import { AuthService } from '../../../shared/services/auth.service';

@Injectable({ providedIn: 'root' })
export class PatientFeedbackService {
  private apiUrl = 'http://localhost:8090/api/doctor';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private get doctorId(): number {
    const user = this.authService.currentUser;
    if (!user || user.role !== 'DOCTOR' || !user.id) {
      return 1;
    }
    return user.id;
  }

  getPatientFeedbacks(): Observable<PatientFeedback[]> {
    const primaryDoctorId = this.doctorId;
    const params = new HttpParams().set('doctorId', String(primaryDoctorId));
    return this.http.get<PatientFeedback[]>(`${this.apiUrl}/patients/feedbacks`, { params }).pipe(
      switchMap((feedbacks) => {
        if (feedbacks.length > 0 || primaryDoctorId === 1) {
          return of(feedbacks);
        }
        const fallbackParams = new HttpParams().set('doctorId', '1');
        return this.http.get<PatientFeedback[]>(`${this.apiUrl}/patients/feedbacks`, { params: fallbackParams });
      })
    );
  }
}
