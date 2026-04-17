import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private apiUrl = 'http://localhost:8081/api/doctors';

  constructor(private http: HttpClient) { }

  getDoctors(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getDoctorById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}