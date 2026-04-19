import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type UserRole = 'PATIENT' | 'DOCTOR' | 'NUTRITIONIST' | 'ADMIN';
export type ReclamationStatus = 'OPEN' | 'IN_PROGRESS' | 'ANSWERED' | 'RESOLVED' | 'REJECTED';
export type ReclamationPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type ReclamationCategory =
  | 'RENDEZ_VOUS'
  | 'CONSULTATION'
  | 'PLAN_ALIMENTAIRE'
  | 'SUIVI_MEDICAL'
  | 'TECHNIQUE'
  | 'FACTURATION'
  | 'AUTRE';

export interface Reclamation {
  id?: number;
  title: string;
  description: string;
  category: ReclamationCategory;
  status?: ReclamationStatus;
  priority: ReclamationPriority;
  createdByRole: UserRole;
  createdById: number;
  targetRole: UserRole;
  handledByRole?: UserRole;
  handledById?: number;
  adminResponse?: string;
  internalNote?: string;
  createdAt?: string;
  updatedAt?: string;
  resolvedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReclamationService {
  private apiUrl = 'http://localhost:8081/api/reclamations';

  constructor(private http: HttpClient) {}

  create(payload: Reclamation): Observable<Reclamation> {
    return this.http.post<Reclamation>(this.apiUrl, payload);
  }

  update(id: number, payload: Reclamation): Observable<Reclamation> {
    return this.http.put<Reclamation>(`${this.apiUrl}/${id}`, payload);
  }

  getAll(): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(this.apiUrl);
  }

  getById(id: number): Observable<Reclamation> {
    return this.http.get<Reclamation>(`${this.apiUrl}/${id}`);
  }

  getMine(userId: number, role: UserRole): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(`${this.apiUrl}/mine?userId=${userId}&role=${role}`);
  }

  getByTargetRole(role: UserRole): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(`${this.apiUrl}/target/${role}`);
  }

  updateStatus(id: number, status: ReclamationStatus, handledById?: number, handledByRole?: UserRole): Observable<Reclamation> {
    let url = `${this.apiUrl}/${id}/status?status=${status}`;
    if (handledById !== undefined) url += `&handledById=${handledById}`;
    if (handledByRole) url += `&handledByRole=${handledByRole}`;
    return this.http.put<Reclamation>(url, {});
  }

  respond(id: number, response: string, internalNote: string, handledById?: number, handledByRole?: UserRole): Observable<Reclamation> {
    let url = `${this.apiUrl}/${id}/response`;
    const params: string[] = [];
    if (handledById !== undefined) params.push(`handledById=${handledById}`);
    if (handledByRole) params.push(`handledByRole=${handledByRole}`);
    if (params.length) url += `?${params.join('&')}`;
    return this.http.put<Reclamation>(url, { response, internalNote });
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}