// user-name.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserNameService {
  private cache: Map<string, string> = new Map();
  private apiUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  getUserName(userId: number, role: string): Observable<string> {
    if (!userId || userId === 0) {
      return of(this.getDefaultName(userId, role));
    }

    const cacheKey = `${role}_${userId}`;
    
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey)!);
    }

    let url = '';
    switch (role) {
      case 'PATIENT':
        url = `${this.apiUrl}/patients/${userId}`;
        break;
      case 'DOCTOR':
        url = `${this.apiUrl}/doctors/${userId}`;
        break;
      case 'NUTRITIONIST':
        url = `${this.apiUrl}/nutritionnists/${userId}`;
        break;
      default:
        return of(this.getDefaultName(userId, role));
    }

    console.log(`🔍 Fetching ${role} ${userId} from ${url}`);

    return this.http.get<any>(url).pipe(
      timeout(10000),
      map(response => {
        console.log(`✅ Response for ${role} ${userId}:`, response);
        let name = '';
        if (role === 'DOCTOR') {
          name = `Dr. ${response.firstName || ''} ${response.lastName || ''}`.trim();
        } else {
          name = `${response.firstName || ''} ${response.lastName || ''}`.trim();
        }
        const result = name || this.getDefaultName(userId, role);
        this.cache.set(cacheKey, result);
        return result;
      }),
      catchError((error) => {
        console.error(`❌ Error fetching ${role} ${userId}:`, error.status, error.statusText);
        const fallback = this.getDefaultName(userId, role);
        this.cache.set(cacheKey, fallback);
        return of(fallback);
      })
    );
  }

  getMultipleUserNames(users: { id: number; role: string }[]): Observable<Map<number, string>> {
    if (users.length === 0) {
      return of(new Map());
    }

    console.log(`📋 Loading ${users.length} users:`, users);

    const observables = users.map(user => 
      this.getUserName(user.id, user.role).pipe(
        map(name => ({ id: user.id, name }))
      )
    );

    return forkJoin(observables).pipe(
      map(results => {
        const nameMap = new Map<number, string>();
        results.forEach(result => {
          nameMap.set(result.id, result.name);
          console.log(`📝 Mapped: ${result.id} -> ${result.name}`);
        });
        return nameMap;
      })
    );
  }

  private getDefaultName(userId: number, role: string): string {
    switch (role) {
      case 'PATIENT': return `Patient #${userId}`;
      case 'DOCTOR': return `Dr. #${userId}`;
      case 'NUTRITIONIST': return `Nutritionniste #${userId}`;
      default: return `Utilisateur #${userId}`;
    }
  }
}