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
  loading = false;
  error = '';
  

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
        this.doctors = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur de chargement des médecins';
        this.loading = false;
        console.error(err);
      }
    });
  }

  startConversation(doctorId: number) {
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
      'PODOLOGUE': 'Podologue'
    };
    return labels[speciality] || speciality;
  }
}