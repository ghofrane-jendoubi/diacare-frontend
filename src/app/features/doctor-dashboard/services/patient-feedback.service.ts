import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { PatientFeedback } from '../models/patient-feedback.model';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({ providedIn: 'root' })
export class PatientFeedbackService {
  private apiUrl = 'http://localhost:8081/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ✅ Récupérer les feedbacks pour le médecin - URL CORRIGÉE
  getPatientFeedbacks(): Observable<PatientFeedback[]> {
    const doctorId = this.getDoctorIdFromStorage();
    
    if (!doctorId) {
      console.warn('⚠️ Aucun ID docteur trouvé');
      return of([]);
    }

    console.log(`🔍 Chargement des feedbacks pour le docteur ID: ${doctorId}`);
    
    // ✅ CORRECTION : Utiliser le bon endpoint
    const params = new HttpParams().set('doctorId', doctorId.toString());
    
    return this.http.get<PatientFeedback[]>(
      `${this.apiUrl}/doctor/patients/feedbacks`,  // ← URL corrigée
      { headers: this.getHeaders(), params }
    ).pipe(
      catchError(error => {
        console.error('Erreur chargement feedbacks docteur:', error);
        return of([]);
      })
    );
  }

  // ✅ Récupérer tous les feedbacks
  getAllFeedbacks(): Observable<PatientFeedback[]> {
    return this.http.get<PatientFeedback[]>(`${this.apiUrl}/feedbacks`, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur chargement feedbacks:', error);
          return of([]);
        })
      );
  }

  // ✅ Récupérer les feedbacks d'un contenu spécifique
  getFeedbacksByContent(contentId: number): Observable<PatientFeedback[]> {
    return this.http.get<PatientFeedback[]>(
      `${this.apiUrl}/feedbacks/content/${contentId}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error(`Erreur chargement feedbacks pour contenu ${contentId}:`, error);
        return of([]);
      })
    );
  }

  // ✅ Récupérer l'ID du docteur depuis localStorage
  private getDoctorIdFromStorage(): number | null {
    const doctorId = localStorage.getItem('doctor_id') || 
                     localStorage.getItem('userId') ||
                     localStorage.getItem('user_id');
    
    if (doctorId) {
      return parseInt(doctorId, 10);
    }
    
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.id && currentUser.role === 'DOCTOR') {
      return currentUser.id;
    }
    
    return null;
  }

  // ✅ Soumettre un feedback (pour patient)
  submitFeedback(contentId: number, emotion: string, comment?: string): Observable<PatientFeedback> {
    const patientId = localStorage.getItem('patient_id');
    
    if (!patientId) {
      throw new Error('Patient non connecté');
    }
    
    const payload = {
      contentId: contentId,
      patientId: parseInt(patientId, 10),
      emotion: emotion,
      comment: comment || null
    };
    
    return this.http.post<PatientFeedback>(
      `${this.apiUrl}/feedbacks`,
      payload,
      { headers: this.getHeaders() }
    );
  }
}