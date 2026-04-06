import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from '../../../shared/services/auth.service';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private apiUrl = 'http://localhost:8090/api/educational';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  submitFeedback(contentId: number, emotion: string, comment?: string): Observable<{ success: boolean }> {
    const userId = this.authService.currentUser?.id;
    if (!userId) {
      return throwError(() => new Error('Utilisateur non authentifie'));
    }

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
              return of({ success: true });
            }
            return throwError(() => err);
          })
        );
      })
    );
  }

  hasFeedback(contentId: number): Observable<boolean> {
    const userId = this.authService.currentUser?.id;
    if (!userId) {
      return of(false);
    }

    const params = new HttpParams().set('userId', String(userId));
    return this.http.get<{ exists: boolean }>(
      `${this.apiUrl}/contents/${contentId}/feedback-exists`,
      { params }
    ).pipe(map((res: { exists: boolean }) => !!res.exists));
  }

  checkFeedbackExists(contentId: number): Observable<boolean> {
    return this.hasFeedback(contentId);
  }
}