import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AiAnalysisService {
  private flaskUrl = 'http://localhost:5002'; 

  constructor(private http: HttpClient) { }

  analyzeImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.flaskUrl}/predict`, formData);
  }
}