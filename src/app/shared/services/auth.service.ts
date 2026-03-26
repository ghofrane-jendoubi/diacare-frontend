import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap, catchError } from 'rxjs';
import { Router } from '@angular/router';

export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR';
  avatarLetter: string;
  diabetesType?: string;
  specialty?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'http://localhost:8090/api/auth';

  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(
    this.loadFromStorage()
  );

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  get currentUser(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  get isPatient(): boolean {
    return this.currentUser?.role === 'PATIENT';
  }

  get isDoctor(): boolean {
    return this.currentUser?.role === 'DOCTOR';
  }

  login(email: string, password: string): Observable<any> {
    console.log('🔐 Tentative login:', { email, password });
    
    const url = `${this.apiUrl}/login`;
    
    // Essayer d'abord avec 'email'
    let body: any = { email, password };
    
    return this.http.post<any>(url, body).pipe(
      tap((res: any) => {
        console.log('✅ Réponse complète du API:', JSON.stringify(res, null, 2));
        
        if (res.success && res.user) {
          // Transformer les données du backend en interface CurrentUser
          const backendUser = res.user;
          const user: CurrentUser = {
            id: backendUser.id,
            name: backendUser.nom && backendUser.prenom 
              ? `${backendUser.nom} ${backendUser.prenom}`
              : backendUser.fullName || backendUser.email,
            email: backendUser.email,
            role: backendUser.role === 'DOCTOR' ? 'DOCTOR' : 'PATIENT',
            avatarLetter: (backendUser.nom?.[0] || 'U').toUpperCase(),
            diabetesType: backendUser.diabetesType,
            specialty: backendUser.specialty
          };
          
          this.currentUserSubject.next(user);
          localStorage.setItem('diacare_user', JSON.stringify(user));
          
          // Stocker le token si fourni
          if (res.token) {
            localStorage.setItem('token', res.token);
            console.log('💾 Token stocké:', res.token.substring(0, 20) + '...');
          }
        } else {
          console.warn('⚠️ Réponse non-succès:', res);
        }
      }),
      catchError((err) => {
        console.error('❌ Erreur au login avec "email":', {
          status: err.status,
          statusText: err.statusText,
          message: err.error?.message || err.statusText
        });
        
        // Si 401, essayer avec 'username' au lieu de 'email'
        if (err.status === 401) {
          console.log('🔄 Tentative avec "username" au lieu de "email"...');
          const bodyWithUsername = { username: email, password };
          
          return this.http.post<any>(url, bodyWithUsername).pipe(
            tap((res: any) => {
              console.log('✅ Réponse avec username:', JSON.stringify(res, null, 2));
              if (res.success && res.user) {
                const backendUser = res.user;
                const user: CurrentUser = {
                  id: backendUser.id,
                  name: backendUser.nom && backendUser.prenom 
                    ? `${backendUser.nom} ${backendUser.prenom}`
                    : backendUser.fullName || backendUser.email,
                  email: backendUser.email,
                  role: backendUser.role === 'DOCTOR' ? 'DOCTOR' : 'PATIENT',
                  avatarLetter: (backendUser.nom?.[0] || 'U').toUpperCase(),
                  diabetesType: backendUser.diabetesType,
                  specialty: backendUser.specialty
                };
                this.currentUserSubject.next(user);
                localStorage.setItem('diacare_user', JSON.stringify(user));
                if (res.token) {
                  localStorage.setItem('token', res.token);
                }
              }
            }),
            catchError((err2) => {
              console.error('❌ Erreur avec "username" aussi:', err2.status);
              return of({ success: false, message: 'Identifiants incorrects.' });
            })
          );
        }
        
        let message = 'Erreur de connexion';
        
        if (err.status === 404) {
          message = 'Endpoint API non trouvé. Vérifiez que le backend s\'exécute.';
        } else if (err.status === 0) {
          message = 'Impossible de contacter le serveur (localhost:8090). Vérifiez que le backend s\'exécute.';
        } else if (err.error?.message) {
          message = err.error.message;
        }
        
        return of({ success: false, message });
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, data);
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('diacare_user');
    this.router.navigate(['/']);
  }

  redirectAfterLogin(): void {
    if (this.isDoctor) {
      this.router.navigate(['/doctor']);
    } else {
      this.router.navigate(['/patient']);
    }
  }

  private loadFromStorage(): CurrentUser | null {
    try {
      const stored = localStorage.getItem('diacare_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}