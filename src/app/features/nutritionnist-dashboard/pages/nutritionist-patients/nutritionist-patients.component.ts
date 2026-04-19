// nutritionist-patients.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChatNutritionService } from '../../../../services/chatnutrition.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-nutritionist-patients',
  templateUrl: './nutritionist-patients.component.html',
  styleUrls: ['./nutritionist-patients.component.css']
})
export class NutritionistPatientsComponent implements OnInit {
  patients: any[] = [];
  isLoading = true;
  errorMessage = '';
  nutritionistId: number | null = null;

  constructor(
    private chatService: ChatNutritionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNutritionistId();
    this.loadPatients();
  }

  loadNutritionistId(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.role === 'NUTRITIONIST') {
      this.nutritionistId = user.id;
    } else {
      const idStr = localStorage.getItem('nutritionist_id');
      if (idStr) {
        this.nutritionistId = parseInt(idStr);
      }
    }
    console.log('Nutritionniste ID:', this.nutritionistId);
  }

// nutritionist-patients.component.ts
loadPatients(): void {
  if (!this.nutritionistId) {
    this.errorMessage = 'Nutritionniste non identifié';
    this.isLoading = false;
    return;
  }

  this.isLoading = true;
  
  this.chatService.getNutritionistConversations(this.nutritionistId).subscribe({
    next: (conversations) => {
      console.log('Conversations reçues:', conversations);
      
      // ✅ Extraire les patients avec les bons champs
      const patientsMap = new Map();
      conversations.forEach(conv => {
        // 🔍 Vérifier la structure exacte des données
        const patientId = conv.patientId || conv.id;
        const firstName = conv.patientFirstName || conv.firstName || `Patient`;
        const lastName = conv.patientLastName || conv.lastName || '';
        
        console.log('Patient extrait:', { patientId, firstName, lastName });
        
        if (patientId && !patientsMap.has(patientId)) {
          patientsMap.set(patientId, {
            id: patientId,           // ← TRÈS IMPORTANT: l'id doit être défini
            firstName: firstName,
            lastName: lastName,
            email: conv.patientEmail || conv.email,
            diabetesType: conv.diabetesType,
            lastMessage: conv.lastMessage,
            lastMessageTime: conv.lastMessageTime,
            unreadCount: conv.unreadCount || 0
          });
        }
      });
      
      this.patients = Array.from(patientsMap.values());
      console.log('Patients finaux:', this.patients);
      this.isLoading = false;
      
      // Fallback si aucun patient
      if (this.patients.length === 0) {
        this.loadMockPatients();
      }
    },
    error: (err) => {
      console.error('Erreur:', err);
      this.loadMockPatients();
    }
  });
}

// Fallback mock
loadMockPatients(): void {
  // ✅ Patient ID 12 qui existe dans la base
  this.patients = [
    {
      id: 12,
      firstName: 'ghofrane',
      lastName: 'jendoubi',
      email: 'jendoubiighofrane@gmail.com',
      diabetesType: 'TYPE_1',
      lastMessage: 'Bonjour',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 1
    }
  ];
  this.isLoading = false;
  console.log('✅ Mock patients chargés:', this.patients);
}

startChat(patient: any): void {
  console.log('🔄 Navigation vers chat avec patient:', patient);
  console.log('Patient ID:', patient.id);
  
  if (patient && patient.id) {
    this.router.navigate(['/nutritionnist/chat', patient.id]);
  } else {
    console.error('❌ Patient ID manquant:', patient);
    this.errorMessage = 'Impossible de démarrer la discussion';
  }
}

viewPatientProfile(patientId: number): void {
  console.log('🔄 Navigation vers profil patient:', patientId);
  
  if (patientId) {
    this.router.navigate(['/nutritionnist/patient', patientId]);
  } else {
    console.error('❌ Patient ID manquant');
  }
}

  getInitials(firstName: string, lastName: string): string {
    return (firstName?.charAt(0) || '') + (lastName?.charAt(0) || '');
  }

  getDiabetesTypeLabel(type: string): string {
    const labels: any = {
      'TYPE_1': 'Diabète Type 1',
      'TYPE_2': 'Diabète Type 2',
      'GESTATIONAL': 'Diabète Gestationnel',
      'PREDIABETES': 'Prédiabète'
    };
    return labels[type] || type || 'Non spécifié';
  }
}