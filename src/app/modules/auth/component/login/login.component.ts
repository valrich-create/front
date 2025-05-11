import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {AuthService} from "../../service/auth.service";

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
      private router: Router
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
            // Ici vous pourriez ajouter une gestion d'erreur plus sophistiquée
          }
        });
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