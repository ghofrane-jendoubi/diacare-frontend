import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService, PatientUser } from '../../../core/services/auth.service';

@Component({
  selector: 'app-patient-profile',
  templateUrl: './patient-profile.component.html',
  styleUrls: ['./patient-profile.component.css']
})
export class PatientProfileComponent implements OnInit {
  currentUser: PatientUser | null = null;
  activeTab: 'info' | 'sante' | 'securite' = 'info';
  isSaving = false;
  successMsg = '';
  errorMsg = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  patientMenuItems = [
    { id: 'medecins',     label: 'Médecins',   link: '/medecins' },
    { id: 'nutrition',    label: 'Nutrition',   link: '/nutrition' },
    { id: 'chatbot',      label: 'Chatbot',     link: '/chatbot' },
    { id: 'reclamations', label: 'Support',     link: '/reclamations' }
  ];

  profileForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    dateOfBirth: '',
    gender: ''
  };

  santeForm = {
    diabetesType: '',
    bloodType: '',
    weight: null as number | null,
    height: null as number | null,
    emergencyContact: '',
    familyHistory: ''
  };

  securiteForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  diabetesTypes = ['TYPE_1', 'TYPE_2', 'GESTATIONAL', 'PREDIABETES', 'OTHER'];
  bloodTypes = [
    'A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE',
    'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'
  ];
  genders = ['HOMME', 'FEMME'];

  constructor(private authService: AuthService, private http: HttpClient) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.profileForm = {
          firstName:   user.firstName || '',
          lastName:    user.lastName  || '',
          email:       user.email     || '',
          phone:       (user as any).phone       || '',
          address:     (user as any).address     || '',
          city:        (user as any).city        || '',
          dateOfBirth: (user as any).dateOfBirth || '',
          gender:      (user as any).gender      || ''
        };
        this.santeForm = {
          diabetesType:     user.diabetesType            || '',
          bloodType:        user.bloodType               || '',
          weight:           (user as any).weight         || null,
          height:           (user as any).height         || null,
          emergencyContact: (user as any).emergencyContact || '',
          familyHistory:    (user as any).familyHistory  || ''
        };
      }
    });
  }

  // ✅ Getter IMC sans opérateur **
  get imc(): string {
    if (!this.santeForm.weight || !this.santeForm.height) return '';
    const h = this.santeForm.height / 100;
    return (this.santeForm.weight / (h * h)).toFixed(1);
  }

  get imcCategory(): { label: string; color: string } {
    const val = parseFloat(this.imc);
    if (!val) return { label: '', color: '' };
    if (val < 18.5) return { label: 'Insuffisance pondérale', color: '#3b82f6' };
    if (val < 25)   return { label: 'Poids normal', color: '#10b981' };
    if (val < 30)   return { label: 'Surpoids', color: '#f97316' };
    return { label: 'Obésité', color: '#ef4444' };
  }

  get initials(): string {
    return this.authService.getInitials();
  }

  get profilePicUrl(): string | null {
    if (this.previewUrl) return this.previewUrl;
    return this.currentUser?.profilePicture
      ? `http://localhost:8081${this.currentUser.profilePicture}`
      : null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => this.previewUrl = e.target?.result as string;
      reader.readAsDataURL(this.selectedFile);
    }
  }

  uploadPhoto(): void {
  if (!this.selectedFile || !this.currentUser) return;
  const fd = new FormData();
  fd.append('file', this.selectedFile);
  
  this.http.post<any>(
    `http://localhost:8081/api/patients/${this.currentUser.id}/upload-photo`, fd
  ).subscribe({
    next: (res) => {
      // res.profilePicture doit contenir le chemin, ex: "/uploads/patients/123/photo.jpg"
      this.authService.updateProfilePicture(res.profilePicture);
      this.selectedFile = null;
      this.previewUrl = null;
      this.showSuccess('Photo de profil mise à jour !');
    },
    error: () => this.showError('Erreur lors du téléchargement de la photo.')
  });
}

  saveInfo(): void {
    if (!this.currentUser) return;
    this.isSaving = true;
    this.http.put<any>(
      `http://localhost:8081/api/patients/${this.currentUser.id}`,
      this.profileForm
    ).subscribe({
      next: (res) => {
        this.authService.setCurrentUser({ ...this.currentUser!, ...res });
        this.isSaving = false;
        this.showSuccess('Profil mis à jour avec succès !');
      },
      error: () => {
        this.isSaving = false;
        this.showError('Erreur lors de la mise à jour du profil.');
      }
    });
  }

  saveSante(): void {
    if (!this.currentUser) return;
    this.isSaving = true;
    this.http.put<any>(
      `http://localhost:8081/api/patients/${this.currentUser.id}/sante`,
      this.santeForm
    ).subscribe({
      next: (res) => {
        this.authService.setCurrentUser({ ...this.currentUser!, ...res });
        this.isSaving = false;
        this.showSuccess('Informations médicales mises à jour !');
      },
      error: () => {
        this.isSaving = false;
        this.showError('Erreur lors de la mise à jour des informations médicales.');
      }
    });
  }

  changePassword(): void {
    if (this.securiteForm.newPassword !== this.securiteForm.confirmPassword) {
      this.showError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (this.securiteForm.newPassword.length < 8) {
      this.showError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (!this.currentUser) return;
    this.isSaving = true;
    this.http.put(
      `http://localhost:8081/api/patients/${this.currentUser.id}/password`,
      {
        currentPassword: this.securiteForm.currentPassword,
        newPassword: this.securiteForm.newPassword
      }
    ).subscribe({
      next: () => {
        this.isSaving = false;
        this.securiteForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
        this.showSuccess('Mot de passe modifié avec succès !');
      },
      error: () => {
        this.isSaving = false;
        this.showError('Mot de passe actuel incorrect.');
      }
    });
  }

  private showSuccess(msg: string): void {
    this.successMsg = msg;
    this.errorMsg = '';
    setTimeout(() => this.successMsg = '', 4000);
  }

  private showError(msg: string): void {
    this.errorMsg = msg;
    this.successMsg = '';
    setTimeout(() => this.errorMsg = '', 4000);
  }
}