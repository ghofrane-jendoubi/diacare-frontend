import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  @Output() toggleSidebar = new EventEmitter<boolean>();

  isCollapsed = false;
  doctorsCount = 0;
  nutritionistsCount = 0;
  patientsCount = 0;
  reclamationsCount = 0;

  private baseUrl = 'http://localhost:8081/api';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCounts();
    this.loadReclamationsCount();
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

  loadReclamationsCount(): void {
    this.http.get<any[]>(`${this.baseUrl}/reclamations`).subscribe({
      next: (data) => {
        this.reclamationsCount = data.filter(r => r.status === 'OPEN' || r.status === 'IN_PROGRESS').length;
      },
      error: () => {}
    });
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}