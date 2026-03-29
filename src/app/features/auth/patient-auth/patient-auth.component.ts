import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-patient-auth',
  templateUrl: './patient-auth.component.html',
  styleUrls: ['./patient-auth.component.css']
})
export class PatientAuthComponent {

  isSignUp = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

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
  bloodTypes    = ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE',
                   'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'];
  genders = ['HOMME', 'FEMME'];

  loginData = { email: '', password: '' };

  constructor(private http: HttpClient, private router: Router) {}

  toggleMode() {
    this.isSignUp = !this.isSignUp;
    this.errorMessage = '';
    this.successMessage = '';
  }

  signUp() {
    this.errorMessage = '';
    const p = this.newPatient;

    if (!p.firstName || !p.lastName || !p.email || !p.phone || !p.password) {
      this.errorMessage = 'Les champs obligatoires (*) doivent être remplis.';
      return;
    }

    this.isLoading = true;

    // Nettoyer les strings vides → null avant envoi
    const payload = {
      firstName:        p.firstName,
      lastName:         p.lastName,
      email:            p.email,
      phone:            p.phone,
      password:         p.password,
      gender:           p.gender        || null,
      diabetesType:     p.diabetesType  || null,
      bloodType:        p.bloodType     || null,
      dateOfBirth:      p.dateOfBirth   || null,
      address:          p.address       || null,
      city:             p.city          || null,
      emergencyContact: p.emergencyContact || null,
      familyHistory:    p.familyHistory || null,
      weight:           p.weight,
      height:           p.height
    };

    this.http.post('http://localhost:8081/api/patients/signup', payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Inscription réussie ! Vérifiez votre email pour activer votre compte.';
        this.isSignUp = false;
        this.newPatient = {
          firstName: '', lastName: '', email: '', phone: '', password: '',
          diabetesType: '', bloodType: '', weight: null, height: null,
          emergencyContact: '', familyHistory: '', dateOfBirth: '', gender: '',
          address: '', city: ''
        };
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erreur lors de l\'inscription.';
      }
    });
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
        localStorage.setItem('patient_id',         res.id);
        localStorage.setItem('patient_email',      res.email);
        localStorage.setItem('patient_firstName',  res.firstName);
        localStorage.setItem('patient_role',       res.role);
        this.router.navigate(['/patient']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Email ou mot de passe incorrect.';
      }
    });
  }
}