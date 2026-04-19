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
  // Dans votre composant, ajoutez ces méthodes et propriétés

specialities = [
  { value: 'ENDOCRINOLOGUE', label: 'Endocrinologue', icon: 'bi-graph-up' },
  { value: 'DIABETOLOGUE', label: 'Diabétologue', icon: 'bi-droplet' },
  { value: 'CARDIOLOGUE', label: 'Cardiologue', icon: 'bi-heart-pulse' },
  { value: 'GENERALISTE', label: 'Généraliste', icon: 'bi-person-badge' },
  { value: 'OPHTALMOLOGISTE', label: 'Ophtalmologiste', icon: 'bi-eye' },
  { value: 'NEPHROLOGUE', label: 'Néphrologue', icon: 'bi-filter-circle' },
  { value: 'PODOLOGUE', label: 'Podologue', icon: 'bi-shoes' }
];

getUniqueSpecialities(): number {
  return new Set(this.doctors.map(d => d.speciality)).size;
}

getInitials(firstName: string, lastName: string): string {
  if (!firstName && !lastName) return 'D';
  return (firstName?.charAt(0) || '') + (lastName?.charAt(0) || '');
}

getAvatarGradient(id: number): string {
  const gradients = [
    'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    'linear-gradient(135deg, #ec4899, #be185d)',
    'linear-gradient(135deg, #10b981, #059669)',
    'linear-gradient(135deg, #f59e0b, #d97706)',
    'linear-gradient(135deg, #06b6d4, #0891b2)'
  ];
  return gradients[id % gradients.length];
}

getSpecialityColor(speciality: string): string {
  const colors: any = {
    'ENDOCRINOLOGUE': 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    'DIABETOLOGUE': 'linear-gradient(135deg, #10b981, #059669)',
    'CARDIOLOGUE': 'linear-gradient(135deg, #ef4444, #dc2626)',
    'GENERALISTE': 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    'OPHTALMOLOGISTE': 'linear-gradient(135deg, #06b6d4, #0891b2)',
    'NEPHROLOGUE': 'linear-gradient(135deg, #f59e0b, #d97706)',
    'PODOLOGUE': 'linear-gradient(135deg, #ec4899, #be185d)'
  };
  return colors[speciality] || 'linear-gradient(135deg, #64748b, #475569)';
}

getSpecialityIcon(speciality: string): string {
  const icons: any = {
    'ENDOCRINOLOGUE': 'bi-graph-up',
    'DIABETOLOGUE': 'bi-droplet',
    'CARDIOLOGUE': 'bi-heart-pulse',
    'GENERALISTE': 'bi-person-badge',
    'OPHTALMOLOGISTE': 'bi-eye',
    'NEPHROLOGUE': 'bi-filter-circle',
    'PODOLOGUE': 'bi-shoes'
  };
  return icons[speciality] || 'bi-stethoscope';
}

resetFilters(): void {
  this.selectedFilter = 'all';
  this.searchTerm = '';
  this.filterDoctors();
}
}