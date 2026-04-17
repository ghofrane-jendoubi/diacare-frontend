import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmotionalDashboard } from '../models/emotional-dashboard.model';

@Injectable({ providedIn: 'root' })
export class EmotionalDashboardService {
  private apiUrl = 'http://localhost:8081/api/admin';

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<EmotionalDashboard> {
    return this.http.get<EmotionalDashboard>(`${this.apiUrl}/emotional-dashboard`);
  }
}
