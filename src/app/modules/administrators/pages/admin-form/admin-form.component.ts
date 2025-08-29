import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    Validators,
    ReactiveFormsModule,
    FormsModule,
    AbstractControl,
    ValidationErrors,
    FormArray,
    FormControl
} from '@angular/forms';
import { LayoutComponent } from "../../../base-component/components/layout/layout.component";
import { NavbarComponent } from "../../../base-component/components/navbar/navbar.component";
import {UserPermission, UserResponse, UserRole} from "../../../users/users.models";
import { Establishment } from "../../../organizations/organization";
import { OrganizationService } from "../../../organizations/organization.service";
import { ActivatedRoute, Router } from "@angular/router";
import { AdministratorServiceService } from "../../services/administrator-service.service";
import { ToastService } from "../../../base-component/services/toast/toast.service";
import {UserService} from "../../../users/services/user.service";

@Component({
    selector: 'app-admin-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, LayoutComponent, NavbarComponent],
    templateUrl: 'admin-form.component.html',
    styleUrls: ['admin-form.component.scss']
})

export class AdminFormComponent implements OnInit {
    @Input() adminData: UserResponse | null = null;
    isEditMode = false;

    adminForm: FormGroup;
    organizations: Establishment[] = [];
    maxBirthDate = new Date();
    roles = Object.values(UserRole);
    authorizations = Object.values(UserPermission);
    characterCount: number = 0;
    maxCharacters: number = 2000;
    permissionsFormArray: FormArray<FormControl<boolean | null>>;

    // Photo profile properties
    selectedFile: File | null = null;
    photoPreview: string | null = null;
    maxFileSize = 5 * 1024 * 1024; // 5MB

    // Password visibility properties
    showPassword = false;
    showConfirmPassword = false;

    constructor(
        private fb: FormBuilder,
        private organizationService: OrganizationService,
        private toastService: ToastService,
        private route: ActivatedRoute,
        private adminService: AdministratorServiceService,
        private userService: UserService,
        private location: Location,
        private router: Router
    ) {
        this.adminForm = this.fb.group({
            id: [''],
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phoneNumber: ['', Validators.required],
            dateOfBirth: ['', this.validateDateNotInFuture.bind(this)],
            placeOfBirth: [''],
            role: ['', Validators.required],
            establishmentId: ['', Validators.required],
            password: ['', [Validators.minLength(8)]],
            confirmPassword: [''],
            permissions: this.fb.array([])
            // permissions: this.fb.array<FormControl<boolean>>([])
        }, { validators: this.passwordMatchValidator });

        this.permissionsFormArray = this.adminForm.get('permissions') as FormArray;
        // this.permissionsFormArray = this.adminForm.get('permissions') as FormArray<FormControl<boolean | null>>;
    }

    ngOnInit(): void {
        this.loadOrganizations();

        const adminId = this.route.snapshot.paramMap.get('id');
        if (adminId) {
            this.isEditMode = true;
            this.loadAdminData(adminId);
        } else {
            this.initializePermissions();
        }
    }

    loadAdminData(id: string): void {
        this.adminService.getAdministratorById(id).subscribe({
            next: (admin) => this.populateForm(admin),
            error: (err) => {
                this.toastService.error(err.message);
                // this.toastService.show('Failed to load admin data', 'danger');
                console.error('Error loading admin:', err);
            }
        });
    }

    initializePermissions(): void {
        this.permissionsFormArray.clear();
        // this.authorizations.forEach(() => {
        //     const control = new FormControl<boolean>(false);
        //     this.permissionsFormArray.push(control);
        // });

        this.authorizations.forEach(() => {
            this.permissionsFormArray.push(this.fb.control(false));
        });
    }

    get permissionsArray(): FormArray {
        return this.adminForm.get('permissions') as FormArray;
    }

    populateForm(admin: UserResponse): void {
        const birthDate = admin.dateOfBirth ?
            new Date(admin.dateOfBirth).toISOString().split('T')[0] : '';

        this.adminForm.patchValue({
            id: admin.id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            phoneNumber: admin.phoneNumber,
            dateOfBirth: birthDate,
            placeOfBirth: admin.placeOfBirth,
            role: admin.role,
            establishmentId: admin.establishmentId
        });

        // Load existing profile photo if available
        if ((admin as any).profilePhotoUrl) {
            this.photoPreview = (admin as any).profilePhotoUrl;
        }

        this.permissionsFormArray.clear();
        this.authorizations.forEach(permission => {
            const hasPermission = admin.permissions?.includes(permission) ?? false;
            const control = new FormControl<boolean>(hasPermission);
            this.permissionsFormArray.push(control);
        });

        this.authorizations.forEach((permission, index) => {
            const hasPermission = admin.permissions?.includes(permission) ?? false;
            this.permissionsFormArray.at(index).setValue(hasPermission);
        });

        if (this.isEditMode) {
            this.adminForm.get('password')?.clearValidators();
            this.adminForm.get('confirmPassword')?.clearValidators();
            this.adminForm.get('password')?.updateValueAndValidity();
            this.adminForm.get('confirmPassword')?.updateValueAndValidity();
        }
    }

    // Photo handling methods
    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];

            // Validate file type
            if (!file.type.startsWith('image/')) {
                this.toastService.show('Please select a valid image file', 'danger');
                return;
            }

            // Validate file size
            if (file.size > this.maxFileSize) {
                this.toastService.show('File size must be less than 5MB', 'danger');
                return;
            }

            this.selectedFile = file;

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                this.photoPreview = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    onDragOver(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
    }

    onDragLeave(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
    }

    onDrop(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();

        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
            const file = files[0];

            // Validate file type
            if (!file.type.startsWith('image/')) {
                this.toastService.show('Please select a valid image file', 'danger');
                return;
            }

            // Validate file size
            if (file.size > this.maxFileSize) {
                this.toastService.show('File size must be less than 5MB', 'danger');
                return;
            }

            this.selectedFile = file;

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                this.photoPreview = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    removePhoto(): void {
        this.selectedFile = null;
        this.photoPreview = null;
        // Reset file input
        const fileInput = document.getElementById('profilePhoto') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    }

    // Password visibility methods
    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    toggleConfirmPasswordVisibility(): void {
        this.showConfirmPassword = !this.showConfirmPassword;
    }

    getSelectedPermissions(): string[] {
        return this.authorizations
            .filter((_, index) => this.permissionsFormArray.at(index).value)
            .map(permission => permission.toString());
    }

    onSubmit(): void {
        if (this.adminForm.valid) {
            const phoneNumber = this.adminForm.get('phoneNumber')?.value;
            if (phoneNumber) {
                this.adminForm.patchValue({
                    phoneNumber: this.cleanPhoneNumber(phoneNumber)
                });
            }

            const formData = new FormData();

            // Add all form fields to FormData
            Object.keys(this.adminForm.value).forEach(key => {
                if (key !== 'permissions' && key !== 'confirmPassword') {
                    const value = this.adminForm.value[key];
                    if (value !== null && value !== undefined && value !== '') {
                        formData.append(key, value);
                    }
                }
            });

            // Add permissions
            const permissions = this.getSelectedPermissions();
            permissions.forEach(permission => {
                formData.append('permissions', permission);
            });

            // Add profile photo if selected
            if (this.selectedFile) {
                formData.append('profilePhoto', this.selectedFile);
            }

            // Remove password if in edit mode and empty
            if (this.isEditMode && !this.adminForm.value.password) {
                formData.delete('password');
            }

            console.log("Valeur de organization:", this.adminForm.value.establishmentId);

            const operation$ = this.isEditMode
                ? this.userService.updateUser(this.adminForm.value.id, formData)
                : this.userService.createUser(formData);

            operation$.subscribe({
                next: () => {
                    const message = this.isEditMode
                        ? 'Admin updated successfully'
                        : 'Admin created successfully';
                    console.log("Data send : {} " ,formData);
                    this.toastService.success(message);
                    this.router.navigate(['/administrators']);
                },
                error: (err) => {
                    const message = this.isEditMode
                        ? 'Failed to update admin'
                        : 'Failed to create admin';
                    this.toastService.error(message);
                    console.error('Operation failed:', err);
                }
            });
        } else {
            this.markFormGroupTouched(this.adminForm);
            this.toastService.show('Please fill all required fields correctly', 'warning');
        }
    }

    loadOrganizations(): void {
        this.organizationService.getAllEstablishmentList().subscribe({
            next: (orgs) => {
                this.organizations = orgs;
                if (orgs.length === 0) {
                    this.toastService.show('No organizations found', 'warning');
                }
            },
            error: (err) => {
                this.toastService.error(err);
                // this.toastService.show('Failed to load organizations', 'danger');
                console.error('Error loading organizations:', err);
            }
        });
    }

    passwordMatchValidator(g: AbstractControl): ValidationErrors | null {
        const password = g.get('password')?.value;
        const confirmPassword = g.get('confirmPassword')?.value;
        return password === confirmPassword ? null : { 'mismatch': true };
    }

    validateDateNotInFuture(control: AbstractControl): ValidationErrors | null {
        if (!control.value) return null;
        const selectedDate = new Date(control.value);
        const today = new Date();
        return selectedDate > today ? { 'futureDate': true } : null;
    }

    markFormGroupTouched(formGroup: FormGroup) {
        Object.values(formGroup.controls).forEach(control => {
            control.markAsTouched();
            if (control instanceof FormGroup) {
                this.markFormGroupTouched(control);
            } else if (control instanceof FormArray) {
                control.controls.forEach(arrayControl => {
                    if (arrayControl instanceof FormGroup) {
                        this.markFormGroupTouched(arrayControl);
                    } else {
                        arrayControl.markAsTouched();
                    }
                });
            }
        });
    }

    /**
     * Nettoie le numéro de téléphone en supprimant tous les espaces
     * @param phoneNumber - Le numéro de téléphone à nettoyer
     * @returns Le numéro de téléphone sans espaces
     */
    private cleanPhoneNumber(phoneNumber: string): string {
        if (!phoneNumber) {
            return phoneNumber;
        }
        return phoneNumber.replace(/\s+/g, '');
    }

    cancel(): void {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            this.location.back();
        }
    }
}