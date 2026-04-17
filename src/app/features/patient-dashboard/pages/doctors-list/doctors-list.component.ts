import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DoctorService } from '../../../../services/doctor.service';

@Component({
  selector: 'app-doctors-list',
  templateUrl: './doctors-list.component.html',
  styleUrls: ['./doctors-list.component.css']
})
export class DoctorsListComponent implements OnInit {
  doctors: any[] = [];
  filteredDoctors: any[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  selectedFilter: string = 'all';

  constructor(
    private doctorService: DoctorService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors() {
    this.loading = true;
    this.doctorService.getDoctors().subscribe({
      next: (data) => {
        console.log('Médecins chargés:', data);
        this.doctors = data;
        this.filteredDoctors = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur de chargement des médecins';
        this.loading = false;
        console.error(err);
      }
    });
  }

  setFilter(speciality: string) {
    this.selectedFilter = speciality;
    this.filterDoctors();
  }

  filterDoctors() {
    let filtered = [...this.doctors];
    
    // Filtrer par spécialité
    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(doctor => doctor.speciality === this.selectedFilter);
    }
    
    // Filtrer par recherche
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(doctor => 
        doctor.firstName?.toLowerCase().includes(term) ||
        doctor.lastName?.toLowerCase().includes(term) ||
        this.getSpecialityLabel(doctor.speciality).toLowerCase().includes(term) ||
        doctor.hospital?.toLowerCase().includes(term) ||
        doctor.licenseNumber?.toLowerCase().includes(term)
      );
    }
    
    this.filteredDoctors = filtered;
  }

  startConversation(doctorId: number) {
  console.log('Doctor ID reçu:', doctorId); 
  
  if (!doctorId) {
    console.error('Doctor ID est null ou undefined');
    return;
  }
  
  this.router.navigate(['/patient/chat', doctorId]);
}

  getSpecialityLabel(speciality: string): string {
    const labels: any = {
      'ENDOCRINOLOGUE': 'Endocrinologue',
      'DIABETOLOGUE': 'Diabétologue',
      'CARDIOLOGUE': 'Cardiologue',
      'GENERALISTE': 'Médecin généraliste',
      'OPHTALMOLOGISTE': 'Ophtalmologiste',
      'NEPHROLOGUE': 'Néphrologue',
      'PODOLOGUE': 'Podologue',
      'NEUROLOGUE': 'Neurologue',
      'PEDIATRE': 'Pédiatre'
    };
    return labels[speciality] || speciality;
  }

  handleImageError(event: any) {
    event.target.src = '/default-doctor.png';
  }
}