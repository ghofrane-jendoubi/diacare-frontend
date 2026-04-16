import { Component, ChangeDetectorRef, HostListener } from '@angular/core';
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
  showForgot = false;
  showPassword = false;
  showSignupPassword = false;
  rememberMe = false;
  signupStep = 1;
  dragOver = false;

  // hCaptcha properties
  hcaptchaToken: string | null = null;
  captchaError = false;

  // Animation properties
  animationState = 'login';

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

  constructor(private http: HttpClient, 
              private router: Router,
              private cdr: ChangeDetectorRef) {}

  getPasswordStrength(): number {
    const password = this.newDoctor.password;
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    return Math.min(strength, 4);
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    if (strength <= 1) return 'Faible';
    if (strength <= 2) return 'Moyen';
    if (strength <= 3) return 'Bon';
    return 'Fort';
  }

  // =================== hCaptcha METHODS ===================
  
  onHCaptchaResolved(token: string): void {
    this.hcaptchaToken = token;
    this.captchaError = false;
    console.log('✅ hCaptcha résolu avec succès pour le médecin');
    this.cdr.detectChanges();
  }

  onHCaptchaExpired(): void {
    this.hcaptchaToken = null;
    this.captchaError = false;
    console.log('⚠️ hCaptcha expiré pour le médecin');
    this.cdr.detectChanges();
  }

  toggleMode() {
    this.isSignUp = !this.isSignUp;
    this.signupStep = 1;
    this.errorMessage = '';
    this.successMessage = '';
    this.certificateFile = null;
    this.certificatePreview = null;
    this.hcaptchaToken = null;
    this.captchaError = false;
    this.cdr.detectChanges();
  }

  nextStep() {
    if (this.signupStep === 1) {
      const d = this.newDoctor;
      if (!d.firstName || !d.lastName || !d.email || !d.phone || !d.password) {
        this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
        return;
      }
      if (d.password.length < 6) {
        this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
        return;
      }
      if (!this.isValidEmail(d.email)) {
        this.errorMessage = 'Veuillez entrer une adresse email valide';
        return;
      }
      this.errorMessage = '';
      this.signupStep++;
      this.cdr.detectChanges();
    } else if (this.signupStep === 2) {
      const d = this.newDoctor;
      if (!d.speciality || !d.licenseNumber || !d.hospital) {
        this.errorMessage = 'Veuillez remplir tous les détails professionnels';
        return;
      }
      this.errorMessage = '';
      this.signupStep++;
      this.cdr.detectChanges();
    }
  }

  prevStep() {
    this.signupStep--;
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  formatSpeciality(spec: string): string {
    const names: any = {
      'CARDIOLOGUE': 'Cardiologue',
      'DIABETOLOGUE': 'Diabétologue',
      'ENDOCRINOLOGUE': 'Endocrinologue',
      'NEPHROLOGUE': 'Néphrologue',
      'NEUROLOGUE': 'Neurologue',
      'OPHTALMOLOGISTE': 'Ophtalmologiste',
      'PEDIATRE': 'Pédiatre',
      'PODOLOGUE': 'Podologue',
      'GENERALISTE': 'Médecin généraliste'
    };
    return names[spec] || spec;
  }

  onCertificateSelected(event: any) {
    const file: File = event.target.files[0];
    this.processCertificate(file);
  }

  private processCertificate(file: File) {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      this.errorMessage = 'Seules les images JPG/PNG sont acceptées';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'La taille maximale est de 5 Mo';
      return;
    }
    this.certificateFile = file;
    this.errorMessage = '';
    const reader = new FileReader();
    reader.onload = (e: any) => this.certificatePreview = e.target.result;
    reader.readAsDataURL(file);
    this.cdr.detectChanges();
  }

  signUp() {
    this.errorMessage = '';
    
    if (!this.certificateFile) {
      this.errorMessage = 'Veuillez télécharger votre certificat médical';
      return;
    }
    
    if (!this.hcaptchaToken) {
      this.captchaError = true;
      this.errorMessage = 'Veuillez compléter la vérification anti-robot';
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();
    
    const formData = new FormData();
    
    const doctorData = {
      ...this.newDoctor,
      hcaptchaToken: this.hcaptchaToken
    };
    
    formData.append('data', new Blob([JSON.stringify(doctorData)], { type: 'application/json' }));
    formData.append('certificate', this.certificateFile, this.certificateFile.name);

    this.http.post('http://localhost:8081/api/doctors/signup', formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Inscription réussie ! Vérifiez votre email pour activer votre compte.';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.toggleMode();
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 3000);
        this.resetForm();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erreur lors de l\'inscription. Veuillez réessayer.';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.errorMessage = '';
          this.cdr.detectChanges();
        }, 5000);
      }
    });
  }

  resetForm() {
    this.newDoctor = {
      firstName: '', lastName: '', email: '', phone: '', password: '',
      speciality: '', licenseNumber: '', yearsOfExperience: null,
      consultationFee: null, hospital: ''
    };
    this.certificateFile = null;
    this.certificatePreview = null;
    this.signupStep = 1;
    this.hcaptchaToken = null;
    this.captchaError = false;
    this.cdr.detectChanges();
  }

  signIn() {
    this.errorMessage = '';
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Email et mot de passe requis';
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();
    
    this.http.post('http://localhost:8081/api/doctors/login', this.loginData).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        
        if (this.rememberMe) {
          localStorage.setItem('remembered_email', this.loginData.email);
        }
        
        localStorage.setItem('doctor_id', res.doctorId);
        localStorage.setItem('doctor_email', res.email);
        localStorage.setItem('doctor_firstName', res.firstName);
        localStorage.setItem('doctor_role', res.role);
        localStorage.setItem('certificate_status', res.certificateStatus);
        
        this.router.navigate(['/doctor']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Email ou mot de passe incorrect';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.errorMessage = '';
          this.cdr.detectChanges();
        }, 5000);
      }
    });
  }
}