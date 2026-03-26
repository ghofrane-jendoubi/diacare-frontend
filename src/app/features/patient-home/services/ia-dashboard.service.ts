import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IaDashboardService {

  private apiUrl = 'http://localhost:8090/api/ia-dashboard';

  constructor(private http: HttpClient) {}

  getDashboard(patientId: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/${patientId}`);
  }

  addMesure(patientId: number, valeur: number,
            moment: string, notes: string = ''): Observable<any> {
    return this.http.post(`${this.apiUrl}/mesure/${patientId}`,
      { valeur, moment, notes });
  }

  getHistorique(patientId: number = 1): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/historique/${patientId}`);
  }
}