import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  @Output() toggleSidebar = new EventEmitter<boolean>();

  // États
  isCollapsed = false;
  isLoading = false;
  activeRole: 'doctors' | 'nutritionists' | 'patients' | null = null;

  // Compteurs
  doctorsCount = 0;
  nutritionistsCount = 0;
  patientsCount = 0;

  // Listes
  doctors: any[] = [];
  nutritionists: any[] = [];
  patients: any[] = [];

  // Sélection utilisateur
  selectedUser: any = null;
  selectedUserType: 'doctor' | 'nutritionist' | 'patient' | null = null;

  private baseUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCounts();
  }

  onToggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.toggleSidebar.emit(this.isCollapsed);
  }

  loadCounts(): void {
    this.http.get<any[]>(`${this.baseUrl}/doctors/pending`).subscribe({
      next: (data) => this.doctorsCount = data.length,
      error: () => {}
    });

    this.http.get<any[]>(`${this.baseUrl}/nutritionists/pending`).subscribe({
      next: (data) => this.nutritionistsCount = data.length,
      error: () => {}
    });

    this.http.get<any[]>(`${this.baseUrl}/patients/all`).subscribe({
      next: (data) => this.patientsCount = data.filter(p => !p.enabled).length,
      error: () => {}
    });
  }

  getIconClass(): string {
    return this.isCollapsed ? 'bi-chevron-right' : 'bi-chevron-left';
  }

  navigateHome(): void {
    window.location.href = '/';
  }
}