import { Component, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-patient-auth',
  templateUrl: './patient-auth.component.html',
  styleUrls: ['./patient-auth.component.css']
})
export class PatientAuthComponent {

  isSignUp = false;
  step = 1;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  rememberMe = false;
  showForgot = false;
  showPassword = false;
  showSignupPassword = false;

  // hCaptcha properties
  hcaptchaToken: string | null = null;
  captchaError = false;

  newPatient = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    diabetesType: '',
    bloodType: '',
    weight: null as number | null,
    height: null as number | null,
    emergencyContact: '',
    familyHistory: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: ''
  };

  diabetesTypes = ['TYPE_1', 'TYPE_2', 'GESTATIONAL', 'PREDIABETES', 'OTHER'];
  bloodTypes = ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE',
                'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'];
  genders = ['HOMME', 'FEMME'];

  loginData = { email: '', password: '' };

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const rememberedEmail = localStorage.getItem('rememberedEmail');
      if (rememberedEmail) {
        this.loginData.email = rememberedEmail;
        this.rememberMe = true;
      }
    }
  }

  // =================== hCaptcha METHODS ===================
  
  onHCaptchaResolved(token: string): void {
    this.hcaptchaToken = token;
    this.captchaError = false;
    console.log('✅ hCaptcha résolu avec succès pour le patient');
    this.cdr.detectChanges();
  }

  onHCaptchaExpired(): void {
    this.hcaptchaToken = null;
    this.captchaError = false;
    console.log('⚠️ hCaptcha expiré pour le patient');
    this.cdr.detectChanges();
  }

  getPasswordStrength(): number {
    const password = this.newPatient.password;
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

  toggleMode() {
    this.isSignUp = !this.isSignUp;
    this.step = 1;
    this.errorMessage = '';
    this.successMessage = '';
    this.hcaptchaToken = null;
    this.captchaError = false;
    this.cdr.detectChanges();
  }

  nextStep() {
    const p = this.newPatient;
    
    if (!p.firstName || !p.lastName || !p.email || !p.phone || !p.password) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }
    
    if (p.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }
    
    if (!this.isValidEmail(p.email)) {
      this.errorMessage = 'Veuillez entrer une adresse email valide';
      return;
    }
    
    if (!this.hcaptchaToken) {
      this.captchaError = true;
      this.errorMessage = 'Veuillez compléter la vérification anti-robot';
      return;
    }
    
    this.errorMessage = '';
    this.captchaError = false;
    this.step = 2;
    this.cdr.detectChanges();
  }

  prevStep() {
    this.step = 1;
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  signUp() {
    this.errorMessage = '';
    const p = this.newPatient;
    
    if (!this.hcaptchaToken) {
      this.captchaError = true;
      this.errorMessage = 'Veuillez compléter la vérification anti-robot';
      return;
    }
    
    this.isLoading = true;
    this.cdr.detectChanges();

    const payload = {
      firstName: p.firstName,
      lastName: p.lastName,
      email: p.email,
      phone: p.phone,
      password: p.password,
      gender: p.gender || null,
      diabetesType: p.diabetesType || null,
      bloodType: p.bloodType || null,
      dateOfBirth: p.dateOfBirth || null,
      address: p.address || null,
      city: p.city || null,
      emergencyContact: p.emergencyContact || null,
      familyHistory: p.familyHistory || null,
      weight: p.weight,
      height: p.height,
      hcaptchaToken: this.hcaptchaToken
    };

    this.http.post('http://localhost:8081/api/patients/signup', payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Inscription réussie ! Vérifiez votre email pour activer votre compte.';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.isSignUp = false;
          this.step = 1;
          this.successMessage = '';
          this.hcaptchaToken = null;
          this.cdr.detectChanges();
        }, 3000);
        this.resetForm();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erreur lors de l\'inscription.';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.errorMessage = '';
          this.cdr.detectChanges();
        }, 5000);
      }
    });
  }

  resetForm() {
    this.newPatient = {
      firstName: '', lastName: '', email: '', phone: '', password: '',
      diabetesType: '', bloodType: '', weight: null, height: null,
      emergencyContact: '', familyHistory: '', dateOfBirth: '', gender: '',
      address: '', city: ''
    };
    this.hcaptchaToken = null;
    this.captchaError = false;
    this.cdr.detectChanges();
  }

  signIn() {
    this.errorMessage = '';
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Email et mot de passe requis.';
      return;
    }
    
    this.isLoading = true;
    this.cdr.detectChanges();
    
    this.http.post('http://localhost:8081/api/patients/login', this.loginData).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        
        if (isPlatformBrowser(this.platformId)) {
          if (this.rememberMe) {
            localStorage.setItem('rememberedEmail', this.loginData.email);
          } else {
            localStorage.removeItem('rememberedEmail');
          }
        }
        
        this.authService.setCurrentUser({
          id: res.id,
          email: res.email,
          firstName: res.firstName,
          lastName: res.lastName,
          diabetesType: res.diabetesType,
          bloodType: res.bloodType,
          profilePicture: res.profilePicture || null
        });
        
        this.router.navigate(['/patient']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Email ou mot de passe incorrect.';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.errorMessage = '';
          this.cdr.detectChanges();
        }, 5000);
      }
    });
  }
}