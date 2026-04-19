import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-nutritionist-auth',
  templateUrl: './nutritionist-auth.component.html',
  styleUrls: ['./nutritionist-auth.component.css']
})
export class NutritionistAuthComponent {

  isSignUp = false;
  signupStep = 1;
  isLoading = false;
  uploadProgress = 0;
  errorMessage = '';
  successMessage = '';
  showForgot = false;
  showPassword = false;
  showSignupPassword = false;
  rememberMe = false;

  // hCaptcha properties
  hcaptchaToken: string | null = null;
  captchaError = false;

  signupData = {
    firstName: '', lastName: '', email: '', phone: '', password: '',
    licenseNumber: '', yearsOfExperience: null as number | null,
    workplace: '', workplaceAddress: ''
  };

  workplaceOptions = ['Cabinet libéral', 'Clinique', 'Hôpital', 'En ligne', 'Autre'];

  certificateFile: File | null = null;
  certificatePreview: string | null = null;

  loginData = { email: '', password: '' };

  constructor(private http: HttpClient, 
              private router: Router,
              private cdr: ChangeDetectorRef) {}

  // =================== hCaptcha METHODS ===================
  
  onHCaptchaResolved(token: string): void {
    this.hcaptchaToken = token;
    this.captchaError = false;
    console.log('✅ hCaptcha résolu avec succès pour le nutritionniste');
    // ✅ FORCER LA MISE À JOUR DE L'INTERFACE
    this.cdr.detectChanges();
  }

  onHCaptchaExpired(): void {
    this.hcaptchaToken = null;
    this.captchaError = false;
    console.log('⚠️ hCaptcha expiré pour le nutritionniste');
    this.cdr.detectChanges();
  }

  getPasswordStrength(): number {
    const password = this.signupData.password;
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
    this.signupStep = 1;
    this.errorMessage = '';
    this.successMessage = '';
    this.hcaptchaToken = null;
    this.captchaError = false;
    this.certificateFile = null;
    this.certificatePreview = null;
    this.cdr.detectChanges();
  }

  nextStep() {
    const data = this.signupData;
    if (!data.firstName || !data.lastName || !data.email || !data.phone || !data.password) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }
    if (data.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }
    if (!this.isValidEmail(data.email)) {
      this.errorMessage = 'Email invalide';
      return;
    }
    if (!this.isValidPhone(data.phone)) {
      this.errorMessage = 'Numéro de téléphone invalide';
      return;
    }
    this.errorMessage = '';
    this.signupStep = 2;
    this.cdr.detectChanges();
  }

  prevStep() {
    this.signupStep = 1;
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  private isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const re = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
    return re.test(phone);
  }

  onCertificateSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;
    
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      this.errorMessage = 'Seules les images JPG/PNG sont acceptées.';
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'Taille maximale : 5 Mo.';
      return;
    }
    
    this.certificateFile = file;
    this.errorMessage = '';
    
    this.simulateUpload();
    
    const reader = new FileReader();
    reader.onload = (e: any) => this.certificatePreview = e.target.result;
    reader.readAsDataURL(file);
    this.cdr.detectChanges();
  }

  private simulateUpload() {
    this.uploadProgress = 0;
    const interval = setInterval(() => {
      if (this.uploadProgress < 100) {
        this.uploadProgress += 10;
        this.cdr.detectChanges();
      } else {
        clearInterval(interval);
      }
    }, 100);
  }

  signUp() {
    this.errorMessage = '';
    
    if (!this.signupData.workplace) {
      this.errorMessage = 'Veuillez sélectionner votre type de cabinet';
      return;
    }
    
    if (!this.certificateFile) {
      this.errorMessage = 'Veuillez télécharger votre certificat';
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
    
    const nutritionistData = {
      ...this.signupData,
      hcaptchaToken: this.hcaptchaToken
    };
    
    formData.append('data', new Blob([JSON.stringify(nutritionistData)],
                    { type: 'application/json' }));
    formData.append('certificate', this.certificateFile, this.certificateFile.name);

    this.http.post('http://localhost:8081/api/nutritionists/signup', formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = '🎉 Inscription réussie ! Vérifiez votre email pour activer votre compte.';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.toggleMode();
          this.resetForm();
        }, 3000);
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

  // nutritionist-auth.component.ts - Modifier la méthode signIn()

signIn() {
  this.errorMessage = '';
  
  if (!this.loginData.email || !this.loginData.password) {
    this.errorMessage = 'Email et mot de passe requis.';
    return;
  }
  
  if (!this.isValidEmail(this.loginData.email)) {
    this.errorMessage = 'Email invalide';
    return;
  }
  
  this.isLoading = true;
  this.cdr.detectChanges();
  
  if (this.rememberMe && typeof localStorage !== 'undefined') {
    localStorage.setItem('remembered_email', this.loginData.email);
  } else if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('remembered_email');
  }
  
  this.http.post('http://localhost:8081/api/nutritionists/login', this.loginData).subscribe({
    next: (res: any) => {
      this.isLoading = false;
      
      // ✅ CRÉER L'OBJET USER COMPLET POUR AUTH SERVICE
      const user = {
        id: res.id,
        firstName: res.firstName,
        lastName: res.lastName,
        email: res.email,
        role: res.role || 'NUTRITIONIST',  // ← IMPORTANT
        phone: res.phone,
        profilePicture: res.profilePicture || null
      };
      
      // ✅ STOCKER DANS LE FORMAT ATTENDU PAR AUTH SERVICE
      localStorage.setItem('user', JSON.stringify(user));
      
      // Stocker le token si présent
      if (res.token) {
        localStorage.setItem('token', res.token);
      } else {
        localStorage.setItem('token', 'authenticated');
      }
      
      // Garder aussi les anciennes clés pour compatibilité (optionnel)
      localStorage.setItem('nutritionist_id', res.id);
      localStorage.setItem('nutritionist_email', res.email);
      localStorage.setItem('nutritionist_firstName', res.firstName);
      localStorage.setItem('nutritionist_lastName', res.lastName);
      localStorage.setItem('login_timestamp', Date.now().toString());
      
      console.log('✅ Nutritionniste connecté:', user);
      
      this.successMessage = 'Connexion réussie ! Redirection...';
      this.cdr.detectChanges();
      
      setTimeout(() => {
        this.router.navigate(['/nutritionnist']);
      }, 1000);
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

  private resetForm() {
    this.signupData = { 
      firstName: '', lastName: '', email: '', phone: '', password: '',
      licenseNumber: '', yearsOfExperience: null, workplace: '', workplaceAddress: '' 
    };
    this.certificateFile = null;
    this.certificatePreview = null;
    this.signupStep = 1;
    this.uploadProgress = 0;
    this.hcaptchaToken = null;
    this.captchaError = false;
    this.cdr.detectChanges();
  }
}