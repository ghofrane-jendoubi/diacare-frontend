import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-doctor-auth',
  templateUrl: './doctor-auth.component.html',
  styleUrls: ['./doctor-auth.component.css']
})
export class DoctorAuthComponent {

  isSignUp = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  newDoctor = {
    firstName: '', lastName: '', email: '', phone: '', password: '',
    speciality: '', licenseNumber: '', yearsOfExperience: null as number | null,
    consultationFee: null as number | null, hospital: ''
  };

 specialities = [
  'CARDIOLOGUE',
  'DIABETOLOGUE',
  'ENDOCRINOLOGUE',
  'NEPHROLOGUE',
  'NEUROLOGUE',
  'OPHTALMOLOGISTE',
  'PEDIATRE',
  'PODOLOGUE',
  'GENERALISTE'
];

  certificateFile: File | null = null;
  certificatePreview: string | null = null;

  loginData = { email: '', password: '' };

  constructor(private http: HttpClient, private router: Router) {}

  toggleMode() {
    this.isSignUp = !this.isSignUp;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onCertificateSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      this.errorMessage = 'Seules les images JPG/PNG sont acceptées.';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'Taille maximale : 5 MB.';
      return;
    }
    this.certificateFile = file;
    this.errorMessage = '';
    const reader = new FileReader();
    reader.onload = (e: any) => this.certificatePreview = e.target.result;
    reader.readAsDataURL(file);
  }

  signUp() {
    this.errorMessage = '';
    const d = this.newDoctor;
    if (!d.firstName || !d.lastName || !d.email || !d.phone ||
        !d.password || !d.speciality || !d.licenseNumber || !d.hospital) {
      this.errorMessage = 'Tous les champs obligatoires (*) doivent être remplis.';
      return;
    }
    if (!this.certificateFile) {
      this.errorMessage = 'Veuillez uploader votre certificat.';
      return;
    }
    this.isLoading = true;
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(this.newDoctor)], { type: 'application/json' }));
    formData.append('certificate', this.certificateFile, this.certificateFile.name);

    this.http.post('http://localhost:8081/api/doctors/signup', formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Inscription réussie ! Vérifiez votre email pour activer votre compte.';
        this.isSignUp = false;
        this.newDoctor = { firstName:'', lastName:'', email:'', phone:'', password:'',
          speciality:'', licenseNumber:'', yearsOfExperience:null, consultationFee:null, hospital:'' };
        this.certificateFile = null;
        this.certificatePreview = null;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erreur lors de l\'inscription.';
      }
    });
  }

  // doctor-auth.component.ts
signIn() {
  this.errorMessage = '';
  if (!this.loginData.email || !this.loginData.password) {
    this.errorMessage = 'Email et mot de passe requis.';
    return;
  }
  this.isLoading = true;
  this.http.post('http://localhost:8081/api/doctors/login', this.loginData).subscribe({
    next: (res: any) => {
      this.isLoading = false;
      
      // ✅ Log détaillé de toutes les propriétés
      console.log('📦 Réponse complète du login:', JSON.stringify(res, null, 2));
      console.log('🔑 Toutes les clés de la réponse:', Object.keys(res));
      console.log('🆔 Valeur de id:', res.id);
      console.log('🆔 Valeur de doctorId:', res.doctorId);
      
      // ✅ Stocker l'ID correctement
      const doctorId = res.id || res.doctorId;
      
      if (!doctorId) {
        console.error('❌ Aucun ID trouvé dans la réponse');
        this.errorMessage = 'Erreur lors de la connexion. ID médecin manquant.';
        return;
      }
      
      localStorage.setItem('doctor_id', doctorId.toString());
      localStorage.setItem('doctor_email', res.email);
      localStorage.setItem('doctor_firstName', res.firstName);
      localStorage.setItem('doctor_lastName', res.lastName);
      localStorage.setItem('doctor_role', res.role);
      localStorage.setItem('certificate_status', res.certificateStatus);
      
      console.log('✅ Doctor_id stocké:', localStorage.getItem('doctor_id'));
      
      this.router.navigate(['/doctor']);
    },
    error: (err) => {
      this.isLoading = false;
      this.errorMessage = err.error?.message || 'Email ou mot de passe incorrect.';
    }
  });
}
}