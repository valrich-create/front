import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { AuthService } from "../../service/auth.service";
import {ToastService} from "../../../base-component/services/toast/toast.service";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss']
})

export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  hidePassword = true;
  phoneRegex = /^\+?[0-9]{10,15}$/;

  constructor(
      private fb: FormBuilder,
      private authService: AuthService,
      private router: Router,
      private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.loginForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(this.phoneRegex)]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    const { phone, password, rememberMe } = this.loginForm.value;

    this.authService.login(phone, password, rememberMe)
        .subscribe({
          next: () => {
            this.router.navigate(['/dashboard']);
          },
          error: (error) => {
            console.error('Erreur de connexion:', error);
            this.isLoading = false;
            this.handleLoginError(error);
          }
        });
  }

  private handleLoginError(error: any): void {
    // Priorité au message du backend
    if (error?.error?.message) {
      this.toastService.error(error.error.message);
      return;
    }

    if (error?.message) {
      this.toastService.error(error.message);
      return;
    }

    // Vérifier si l'utilisateur est hors ligne
    if (!navigator.onLine) {
      this.toastService.error("Vous êtes hors ligne. Vérifiez votre connexion Internet.");
      return;
    }

    const status = error?.status;
    let errorMessage: string;

    switch (status) {
      case 0:
        errorMessage = "Serveur injoignable. Veuillez réessayer plus tard.";
        break;
      case 400:
        errorMessage = "Requête invalide. Vérifiez les informations saisies.";
        break;
      case 401:
        errorMessage = "Numéro de téléphone ou mot de passe incorrect.";
        break;
      case 403:
        errorMessage = "Accès refusé.";
        break;
      case 404:
        errorMessage = "Service de connexion indisponible.";
        break;
      case 408:
        errorMessage = "Délai d'attente dépassé. Veuillez réessayer.";
        break;
      case 429:
        errorMessage = "Trop de tentatives. Réessayez plus tard.";
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        errorMessage = "Erreur serveur. Veuillez réessayer plus tard.";
        break;
      default:
        errorMessage = "Une erreur inattendue s'est produite. Veuillez réessayer.";
    }

    this.toastService.error(errorMessage);
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  showEmailError(): boolean {
    const control = this.loginForm.get('email');
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  showPhoneError(): boolean {
    const control = this.loginForm.get('phone');
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  showPasswordError(): boolean {
    const control = this.loginForm.get('password');
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}