import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = 'http://localhost:8081/api/patients';

  constructor(private http: HttpClient) { }

  getPatientById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
  getDoctorPatients(doctorId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/doctor/${doctorId}/patients`);
}
}