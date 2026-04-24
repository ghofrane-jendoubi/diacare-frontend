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
  pendingOrdersCount = 0;
  pendingDeliveriesCount = 0;

  private baseUrl = 'http://localhost:8081/api';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCounts();
    this.loadReclamationsCount();
    this.loadPendingOrdersCount();
    this.loadPendingDeliveriesCount();
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

  loadPendingOrdersCount(): void {
    this.http.get<any[]>(`${this.baseUrl}/orders/admin/paid-orders`).subscribe({
      next: (orders) => {
        // Compter les commandes en attente de livraison (non livrées)
        this.pendingOrdersCount = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;
      },
      error: () => {}
    });
  }

  loadPendingDeliveriesCount(): void {
    this.http.get<any[]>(`${this.baseUrl}/delivery/admin/all`).subscribe({
      next: (deliveries) => {
        // Compter les livraisons en cours
        this.pendingDeliveriesCount = deliveries.filter(d => 
          d.status !== 'DELIVERED' && d.status !== 'CANCELLED'
        ).length;
      },
      error: () => {}
    });
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}