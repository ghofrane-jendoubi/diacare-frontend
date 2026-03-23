import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-doctor-sidebar',
  templateUrl: './doctor-sidebar.component.html',
  styleUrls: ['./doctor-sidebar.component.css']
})
export class DoctorSidebarComponent implements OnInit {
  doctorInfo: any = {
    name: 'Dr. Ahmed Benani',
    speciality: 'Endocrinologue',
    licenseNumber: '12345',
    online: true,
    profilePicture: null
  };
  
  unreadMessagesCount = 0;
  pendingAppointmentsCount = 0;
  totalPatientsCount = 0;
  pendingAnalysesCount = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadDoctorInfo();
    this.loadCounters();
  }

  loadDoctorInfo(): void {
    // Récupérer les infos du médecin depuis le localStorage ou l'API
    const storedDoctor = localStorage.getItem('doctorInfo');
    if (storedDoctor) {
      this.doctorInfo = JSON.parse(storedDoctor);
    }
  }

  loadCounters(): void {
    // Charger les compteurs depuis l'API
    // Pour l'exemple, on met des valeurs statiques
    this.unreadMessagesCount = 5;
    this.pendingAppointmentsCount = 8;
    this.totalPatientsCount = 245;
    this.pendingAnalysesCount = 12;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    // Logique de déconnexion
    localStorage.removeItem('token');
    localStorage.removeItem('doctorInfo');
    this.router.navigate(['/login']);
  }
}