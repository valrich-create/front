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
  selectedPhoto: File | null = null;
  photoPreviewUrl: string | null = null;
  existingPhotoUrl: string | null = null;

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

      // Afficher la photo existante si disponible
      if (admin.profileImageUrl) {
        this.existingPhotoUrl = admin.profileImageUrl;
      }
    });
  }

  initForm(): void {
    this.adminForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, this.validatePhoneNumber]],
      password: ['', [Validators.required, Validators.minLength(8), this.validatePasswordStrength]],
      confirmPassword: [''],
      photo: [null] // Nouveau champ pour la photo
    }, { validators: this.passwordMatchValidator });

    if (this.isEditMode) {
      this.adminForm.get('password')?.clearValidators();
      this.adminForm.get('confirmPassword')?.clearValidators();
      this.adminForm.get('password')?.updateValueAndValidity();
      this.adminForm.get('confirmPassword')?.updateValueAndValidity();
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedPhoto = file;
      this.adminForm.patchValue({
        photo: file
      });

      // Créer l'aperçu
      this.photoPreviewUrl = URL.createObjectURL(file);

      // Supprimer l'ancienne URL d'aperçu s'il y en avait une
      if (this.existingPhotoUrl) {
        this.existingPhotoUrl = null;
      }
    }
  }

  removePhoto(): void {
    this.selectedPhoto = null;
    this.photoPreviewUrl = null;
    this.existingPhotoUrl = null;
    this.adminForm.patchValue({
      photo: null
    });

    // Réinitialiser l'input file
    const fileInput = document.getElementById('photoInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
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
      const formData = new FormData();

      // Ajouter tous les champs du formulaire à FormData
      formData.append('firstName', this.adminForm.get('firstName')?.value || '');
      formData.append('lastName', this.adminForm.get('lastName')?.value || '');
      formData.append('email', this.adminForm.get('email')?.value || '');
      formData.append('phoneNumber', this.adminForm.get('phoneNumber')?.value || '');

      // Ajouter le mot de passe seulement si ce n'est pas le mode édition ou s'il y a une valeur
      if (!this.isEditMode && this.adminForm.get('password')?.value) {
        formData.append('password', this.adminForm.get('password')?.value);
      }

      // Ajouter la photo seulement si un fichier est sélectionné
      if (this.selectedPhoto) {
        formData.append('photo', this.selectedPhoto, this.selectedPhoto.name);
      }

      if (this.isEditMode && this.currentAdminId) {
        this.adminService.updateAdministrator(this.currentAdminId, formData).subscribe({
          next: () => {
            this.toastService.success('Operation reussie!');
            this.router.navigate(['/super-admin'])
          },
          error: (err) => {
            this.toastService.error(err.error.message || err.message);
            console.error('Update failed:', err)
          }
        });
      } else {
        this.adminService.createAdministrator(formData).subscribe({
          next: () => {
            this.toastService.success('Operation reussie!');
            this.router.navigate(['/super-admin'])
          },
          error: (err) => {
            this.toastService.error(err.error.message || err.message);
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