import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  email     = '';
  password  = '';
  isLoading = false;
  error     = '';
  showPassword = false;

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.isLoggedIn) {
      this.authService.redirectAfterLogin();
    }
  }

  login(): void {
    if (!this.email || !this.password) {
      this.error = 'Veuillez remplir tous les champs.';
      return;
    }
    
    this.isLoading = true;
    this.error = '';
    
    console.log('📧 Login avec email:', this.email);
    console.log('Profitez de: Chrome DevTools > Console pour voir le JSON du backend');

    this.authService.login(this.email, this.password).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        console.log('✅ Réponse reçue au UI:', res);
        
        if (res.success) {
          console.log('✅ Authentification réussie! Redirection...');
          this.authService.redirectAfterLogin();
        } else {
          this.error = res.message || 'Identifiants incorrects';
          console.warn('⚠️ Réponse KO:', {
            message: res.message,
            success: res.success,
            fullResponse: res
          });
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('💥 Erreur complète:', err);
        this.error = err.message || 'Erreur serveur. Vérifiez votre connexion.';
      }
    });
  }
}