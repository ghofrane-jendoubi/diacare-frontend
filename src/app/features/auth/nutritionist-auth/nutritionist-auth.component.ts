import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-nutritionist-auth',
  templateUrl: './nutritionist-auth.component.html',
  styleUrls: ['./nutritionist-auth.component.css']
})
export class NutritionistAuthComponent {

  isSignUp = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  newNutritionist = {
    firstName: '', lastName: '', email: '', phone: '', password: '',
    licenseNumber: '', yearsOfExperience: null as number | null,
    workplace: '', workplaceAddress: ''
  };

  workplaceOptions = ['Cabinet libéral', 'Clinique', 'Hôpital', 'En ligne', 'Autre'];

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
    const n = this.newNutritionist;
    if (!n.firstName || !n.lastName || !n.email || !n.phone || !n.password || !n.workplace) {
      this.errorMessage = 'Tous les champs obligatoires (*) doivent être remplis.';
      return;
    }
    if (!this.certificateFile) {
      this.errorMessage = 'Veuillez uploader votre certificat.';
      return;
    }
    this.isLoading = true;
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(this.newNutritionist)],
                    { type: 'application/json' }));
    formData.append('certificate', this.certificateFile, this.certificateFile.name);

    this.http.post('http://localhost:8081/api/nutritionists/signup', formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Inscription réussie ! Vérifiez votre email pour activer votre compte.';
        this.isSignUp = false;
        this.newNutritionist = { 
          firstName: '', lastName: '', email: '', phone: '', password: '',
          licenseNumber: '', yearsOfExperience: null, workplace: '', workplaceAddress: '' 
        };
        this.certificateFile = null;
        this.certificatePreview = null;
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
    this.http.post('http://localhost:8081/api/nutritionists/login', this.loginData).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        
        // Stocker les informations du nutritionniste
        localStorage.setItem('nutritionist_id', res.id);
        localStorage.setItem('nutritionist_email', res.email);
        localStorage.setItem('nutritionist_firstName', res.firstName);
        localStorage.setItem('nutritionist_lastName', res.lastName);
        localStorage.setItem('nutritionist_role', res.role);
        localStorage.setItem('nutritionist_workplace', res.workplace);
        localStorage.setItem('certificate_status', res.certificateStatus);
        localStorage.setItem('token', 'authenticated');
        
        // ✅ CORRECTION: Rediriger vers le bon dashboard
        this.router.navigate(['/nutritionist-dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Email ou mot de passe incorrect.';
      }
    });
  }
}