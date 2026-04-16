import { Component, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',  // ← Ce selector doit correspondre
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.css']
})
export class ForgotPasswordComponent {
  @Input() actor: string = 'patients';

  step: 'email' | 'code' | 'newPassword' | 'done' = 'email';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  email = '';
  code = '';
  newPassword = '';
  confirmPassword = '';
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(private http: HttpClient) {}

  get baseUrl(): string {
    return `http://localhost:8081/api/${this.actor}`;
  }

  sendCode(): void {
    if (!this.email) {
      this.errorMessage = 'Veuillez entrer votre email.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.post(`${this.baseUrl}/forgot-password`, { email: this.email })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.step = 'code';
          this.successMessage = `Un code a été envoyé à ${this.email}`;
          setTimeout(() => this.successMessage = '', 5000);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Email introuvable.';
        }
      });
  }

  verifyCode(): void {
    if (!this.code || this.code.length !== 6) {
      this.errorMessage = 'Veuillez entrer le code à 6 chiffres.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.post(`${this.baseUrl}/verify-reset-code`, {
      email: this.email,
      code: this.code
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.step = 'newPassword';
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Code incorrect ou expiré.';
      }
    });
  }

  resetPassword(): void {
    if (!this.newPassword || this.newPassword.length < 8) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 8 caractères.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    this.http.post(`${this.baseUrl}/reset-password`, {
      email: this.email,
      code: this.code,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.step = 'done';
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la réinitialisation.';
      }
    });
  }

  resendCode(): void {
    this.code = '';
    this.errorMessage = '';
    this.sendCode();
  }

  restart(): void {
    this.step = 'email';
    this.email = '';
    this.code = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.errorMessage = '';
    this.successMessage = '';
  }
}