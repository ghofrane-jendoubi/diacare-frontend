import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentService } from '../../../services/appointment.service';
import { MessageService } from '../../../services/message.service';
import { PatientService } from '../../../services/patient.service';

@Component({
  selector: 'app-doctor-sidebar',
  templateUrl: './doctor-sidebar.component.html',
  styleUrls: ['./doctor-sidebar.component.css']
})
export class DoctorSidebarComponent implements OnInit, OnDestroy {
  // ✅ Ajouter la propriété isCollapsed
  isCollapsed = false;
  
  doctorInfo: any = {
    id: null,
    name: 'Dr. Ahmed Benani',
    firstName: '',
    lastName: '',
    speciality: 'Endocrinologue',
    licenseNumber: '12345',
    online: true,
    profilePicture: null,
    email: '',
    hospital: '',
    yearsOfExperience: 0
  };
  
  unreadMessagesCount = 0;
  pendingAppointmentsCount = 0;
  totalPatientsCount = 0;
  pendingAnalysesCount = 0;
  
  private refreshInterval: any;

  constructor(
    private router: Router,
    private appointmentService: AppointmentService,
    private messageService: MessageService,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.loadDoctorInfo();
    this.loadCounters();
    
    // Rafraîchir les compteurs toutes les 30 secondes
    this.refreshInterval = setInterval(() => {
      this.loadCounters();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  // ✅ Ajouter la méthode toggleSidebar
  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  loadDoctorInfo(): void {
    // Récupérer les infos du médecin depuis localStorage
    const doctorId = localStorage.getItem('doctor_id');
    const firstName = localStorage.getItem('doctor_firstName');
    const lastName = localStorage.getItem('doctor_lastName');
    const email = localStorage.getItem('doctor_email');
    const speciality = localStorage.getItem('doctor_speciality');
    const hospital = localStorage.getItem('doctor_hospital');
    const experience = localStorage.getItem('doctor_yearsOfExperience');
    
    if (doctorId) {
      this.doctorInfo.id = parseInt(doctorId);
    }
    
    if (firstName && lastName) {
      this.doctorInfo.firstName = firstName;
      this.doctorInfo.lastName = lastName;
      this.doctorInfo.name = `Dr. ${firstName} ${lastName}`;
    }
    
    if (email) {
      this.doctorInfo.email = email;
    }
    
    if (speciality) {
      this.doctorInfo.speciality = this.getSpecialityLabel(speciality);
    }
    
    if (hospital) {
      this.doctorInfo.hospital = hospital;
    }
    
    if (experience) {
      this.doctorInfo.yearsOfExperience = parseInt(experience);
    }
    
    // Récupérer la licence depuis localStorage ou API
    const license = localStorage.getItem('doctor_licenseNumber');
    if (license) {
      this.doctorInfo.licenseNumber = license;
    }
  }

  loadCounters(): void {
    const doctorId = this.doctorInfo.id;
    if (!doctorId) return;
    
    // Charger les messages non lus
    this.messageService.getDoctorConversations(doctorId).subscribe({
      next: (data) => {
        this.unreadMessagesCount = data.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      },
      error: (err) => console.error('Erreur chargement messages:', err)
    });
    
    // Charger les rendez-vous en attente
    this.appointmentService.getDoctorAppointments(doctorId).subscribe({
      next: (data) => {
        const today = new Date();
        this.pendingAppointmentsCount = data.filter(app => 
          new Date(app.startTime) > today && app.status !== 'annulé'
        ).length;
      },
      error: (err) => console.error('Erreur chargement rendez-vous:', err)
    });
    
    // Charger le nombre de patients
    this.patientService.getDoctorPatients(doctorId).subscribe({
      next: (data) => {
        this.totalPatientsCount = data.length;
      },
      error: (err) => console.error('Erreur chargement patients:', err)
    });
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

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    // Nettoyer le localStorage
    localStorage.removeItem('doctor_id');
    localStorage.removeItem('doctor_email');
    localStorage.removeItem('doctor_firstName');
    localStorage.removeItem('doctor_lastName');
    localStorage.removeItem('doctor_role');
    localStorage.removeItem('certificate_status');
    localStorage.removeItem('doctor_speciality');
    localStorage.removeItem('doctor_hospital');
    localStorage.removeItem('doctor_licenseNumber');
    localStorage.removeItem('doctor_yearsOfExperience');
    
    this.router.navigate(['/doctor/login']);
  }
}