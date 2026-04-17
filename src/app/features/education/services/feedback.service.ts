import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private apiUrl = 'http://localhost:8081/api/educational';
  
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Helper pour récupérer l'ID utilisateur
  private getUserId(): number {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      console.warn('Aucun utilisateur authentifié, utilisation de l\'ID par défaut 1');
      return 1; // Fallback ID
    }
    return user.id;
  }

  submitFeedback(contentId: number, emotion: string, comment?: string): Observable<{ success: boolean }> {
    const userId = this.getUserId();

    return this.hasFeedback(contentId).pipe(
      switchMap((exists) => {
        if (exists) {
          return of({ success: true });
        }

        return this.http.post<{ success: boolean }>(
          `${this.apiUrl}/contents/${contentId}/feedback?userId=${userId}`,
          {
            emotion,
            comment
          }
        ).pipe(
          catchError((err) => {
            if (err?.status === 409) {
              // Feedback déjà existant
              return of({ success: true });
            }
            console.error('Erreur lors de l\'envoi du feedback:', err);
            return throwError(() => err);
          })
        );
      })
    );
  }

  hasFeedback(contentId: number): Observable<boolean> {
    const userId = this.getUserId();

    const params = new HttpParams().set('userId', String(userId));
    return this.http.get<{ exists: boolean }>(
      `${this.apiUrl}/contents/${contentId}/feedback-exists`,
      { params }
    ).pipe(
      map((res: { exists: boolean }) => !!res.exists),
      catchError((err) => {
        console.error('Erreur lors de la vérification du feedback:', err);
        return of(false);
      })
    );
  }

  checkFeedbackExists(contentId: number): Observable<boolean> {
    return this.hasFeedback(contentId);
  }
}