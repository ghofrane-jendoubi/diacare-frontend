import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  form = {
    name: '',
    email: '',
    password: '',
    role: 'PATIENT',
    diabetesType: 'type2'
  };
  isLoading = false;
  error     = '';
  success   = '';

  constructor(private authService: AuthService, private router: Router) {}

  register(): void {
    if (!this.form.name || !this.form.email || !this.form.password) {
      this.error = 'Tous les champs sont obligatoires.';
      return;
    }
    this.isLoading = true;
    this.error = '';

    this.authService.register(this.form).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.success) {
          this.success = '✅ Compte créé ! Redirection vers le login...';
          setTimeout(() => this.router.navigate(['/login']), 1500);
        } else {
          this.error = res.message || 'Erreur lors de la création';
        }
      },
      error: () => {
        this.isLoading = false;
        this.error = 'Erreur serveur. Vérifiez votre connexion.';
      }
    });
  }
}