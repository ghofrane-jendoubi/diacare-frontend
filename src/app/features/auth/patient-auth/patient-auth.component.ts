import { Component } from '@angular/core';
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
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Récupérer l'email sauvegardé si "Se souvenir de moi" était coché
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.loginData.email = rememberedEmail;
      this.rememberMe = true;
    }
  }

  toggleMode() {
    this.isSignUp = !this.isSignUp;
    this.step = 1;
    this.errorMessage = '';
    this.successMessage = '';
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
    this.errorMessage = '';
    this.step = 2;
  }

  prevStep() {
    this.step = 1;
    this.errorMessage = '';
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  signUp() {
    this.errorMessage = '';
    const p = this.newPatient;

    this.isLoading = true;

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
      height: p.height
    };

    this.http.post('http://localhost:8081/api/patients/signup', payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Inscription réussie ! Vérifiez votre email pour activer votre compte.';
        setTimeout(() => {
          this.isSignUp = false;
          this.step = 1;
          this.successMessage = '';
        }, 3000);
        this.resetForm();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erreur lors de l\'inscription.';
        setTimeout(() => {
          this.errorMessage = '';
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
  }

  signIn() {
    this.errorMessage = '';
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Email et mot de passe requis.';
      return;
    }
    
    this.isLoading = true;
    
    this.http.post('http://localhost:8081/api/patients/login', this.loginData).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        
        // Gérer "Se souvenir de moi"
        if (this.rememberMe) {
          localStorage.setItem('rememberedEmail', this.loginData.email);
        } else {
          localStorage.removeItem('rememberedEmail');
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
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }
}