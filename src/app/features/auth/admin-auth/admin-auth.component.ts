import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-auth',
  templateUrl: './admin-auth.component.html',
  styleUrls: ['./admin-auth.component.css']
})
export class AdminAuthComponent {
  isSignUp: boolean = false;

  newUser = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: ''
  };

  profilePicture: File | null = null;

  loginData = {
    email: '',
    password: ''
  };

  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  toggleMode() {
    this.isSignUp = !this.isSignUp;
    this.errorMessage = '';
    this.successMessage = '';
  }

  signUp() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.newUser.firstName || !this.newUser.lastName || !this.newUser.email || !this.newUser.phone || !this.newUser.password) {
      this.errorMessage = 'Tous les champs sont obligatoires.';
      return;
    }

    this.http.post('http://localhost:8081/api/admins/signup', this.newUser)
      .subscribe({
        next: () => {
          this.successMessage = 'Inscription réussie. Vérifiez votre email pour activer le compte.';
          this.isSignUp = false;
          this.newUser = {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: ''
          };
        },
        error: (err) => {
          console.error('Erreur inscription', err);
          this.errorMessage = err.error?.message || 'Erreur lors de l’inscription.';
        }
      });
  }

  signIn() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Email et mot de passe requis.';
      return;
    }

    this.http.post('http://localhost:8081/api/admins/login', this.loginData)
      .subscribe({
        next: (response: any) => {
          localStorage.setItem('admin_id', response.id);
          localStorage.setItem('admin_email', response.email);
          localStorage.setItem('admin_firstName', response.firstName);
          localStorage.setItem('admin_lastName', response.lastName);
          localStorage.setItem('admin_role', response.role);

          this.router.navigate(['/admin']);
        },
        error: (err) => {
          console.error('Erreur connexion', err);
          this.errorMessage = err.error?.message || 'Email ou mot de passe incorrect.';
        }
      });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.profilePicture = file;
    }
  }
}