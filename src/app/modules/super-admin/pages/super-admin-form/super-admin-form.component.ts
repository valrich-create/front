import {Component, OnInit} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from "@angular/forms";
import {AdministratorServiceService} from "../../../administrators/services/administrator-service.service";
import {ActivatedRoute, Router} from "@angular/router";
import {CommonModule, NgClass} from "@angular/common";
import {NavbarComponent} from "../../../base-component/components/navbar/navbar.component";
import {LayoutComponent} from "../../../base-component/components/layout/layout.component";
import {ToastService} from "../../../base-component/services/toast/toast.service";

@Component({
  selector: 'app-super-admin-form',
  imports: [
      CommonModule,
    NgClass,
    ReactiveFormsModule,
    NavbarComponent,
    LayoutComponent
  ],
  templateUrl: "super-admin-form.component.html",
  styleUrls: ["super-admin-form.component.scss"]
})
export class SuperAdminFormComponent implements OnInit {
  adminForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isEditMode = false;
  currentAdminId: string | null = null;

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  constructor(
      private fb: FormBuilder,
      private adminService: AdministratorServiceService,
      private toastService: ToastService,
      private router: Router,
      private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
    console.log('Mode:', this.isEditMode ? 'ÉDITION' : 'CRÉATION');
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.currentAdminId = id;
      this.loadAdminData(id);
    }
  }

  loadAdminData(id: string): void {
    this.adminService.getAdministratorById(id).subscribe(admin => {
      this.adminForm.patchValue({
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        phoneNumber: admin.phoneNumber
      });
    });
  }

  initForm(): void {
    this.adminForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, this.validatePhoneNumber]],
      password: ['', [Validators.required, Validators.minLength(8), this.validatePasswordStrength]],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });

    if (this.isEditMode) {
      this.adminForm.get('password')?.clearValidators();
      this.adminForm.get('confirmPassword')?.clearValidators();
      this.adminForm.get('password')?.updateValueAndValidity();
      this.adminForm.get('confirmPassword')?.updateValueAndValidity();
    }
  }

  validatePhoneNumber(control: AbstractControl): ValidationErrors | null {
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    return phoneRegex.test(control.value) ? null : { invalidPhone: true };
  }

  validatePasswordStrength(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;

    const hasNumber = /[0-9]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSpecial = /[@#$%^&+=]/.test(password);
    const noWhitespace = /^\S+$/.test(password);

    const valid = hasNumber && hasUpper && hasLower && hasSpecial && noWhitespace;
    return valid ? null : { passwordWeak: true };
  }

  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { 'mismatch': true };
  }

  onSubmit(): void {
    if (this.adminForm.valid) {
      const formData = this.adminForm.value;
      delete formData.confirmPassword;

      if (this.isEditMode && !formData.password) {
        delete formData.password;
      }

      if (this.isEditMode && this.currentAdminId) {
        this.adminService.updateAdministrator(this.currentAdminId, formData).subscribe({
          next: () => {
            this.toastService.show('Operation successfully done!', 'success');
            this.router.navigate(['/super-admin'])
          },
          error: (err) => {
            this.toastService.show('Error occurred, Try again later', 'danger');
            console.error('Update failed:', err)
          }
        });
      } else {
        this.adminService.createAdministrator(formData).subscribe({
          next: () => {
            this.toastService.show('Operation successfully done!', 'success');
            this.router.navigate(['/super-admin'])
          },
          error: (err) => {
            this.toastService.show('Error occurred, Try again later', 'danger');
            console.error('Creation failed:', err)
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.adminForm);
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/super-admin']);
  }

}
