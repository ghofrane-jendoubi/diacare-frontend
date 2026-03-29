// patient-layout.component.ts
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-patient-layout',
  templateUrl: './patient-layout.component.html',
  styleUrls: ['./patient-layout.component.css']
})
export class PatientLayoutComponent implements OnInit {
  patientMenuItems = [
    { id: 'doctors',      label: 'Médecins',        link: '/patient/doctors' },
    { id: 'nutrition',    label: 'Nutrition',        link: '/patient/nutrition' },
    { id: 'education',    label: 'Éducation',        link: '/patient/education' },
    { id: 'messagerie',  label: 'Messagerie',  link: '/patient/chat' },
    { id: 'pharmacy',     label: 'Parapharmacie',    link: '/patient/pharmacy' },
    { id: 'chatbot',      label: 'Chatbot',          link: '/patient/chatbot' },
    { id: 'reclamations', label: 'Support',          link: '/patient/reclamations' }
  ];

  patientId: number | null = null;
  userName: string = '';
  userEmail: string = '';

  ngOnInit(): void {
    this.loadPatientInfo();
  }

  loadPatientInfo(): void {
    const patientIdStr = localStorage.getItem('patient_id');
    if (patientIdStr) this.patientId = parseInt(patientIdStr);

    const firstName = localStorage.getItem('patient_firstName');
    const lastName  = localStorage.getItem('patient_lastName');
    this.userName = firstName && lastName
      ? `${firstName} ${lastName}`
      : firstName || 'Patient';

    const email = localStorage.getItem('patient_email');
    if (email) this.userEmail = email;
  }
}


