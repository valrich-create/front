import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { Admin } from "../../admin";
import { ActivatedRoute, Router } from "@angular/router";
import { AdministratorServiceService } from "../../services/administrator-service.service";
import { ToastService } from "../../../base-component/services/toast/toast.service";

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

    constructor(
        private fb: FormBuilder,
        private organizationService: OrganizationService,
        private toastService: ToastService,
        private route: ActivatedRoute,
        private adminService: AdministratorServiceService,
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
            organization: ['', Validators.required],
            password: ['', [Validators.minLength(8)]],
            confirmPassword: [''],
            permissions: this.fb.array<FormControl<boolean>>([])
        }, { validators: this.passwordMatchValidator });

        this.permissionsFormArray = this.adminForm.get('permissions') as FormArray<FormControl<boolean | null>>;
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

    initializePermissions(): void {
        this.permissionsFormArray.clear();
        this.authorizations.forEach(() => {
            const control = new FormControl<boolean>(false); // 👈 important
            this.permissionsFormArray.push(control);
        });

    }

    loadAdminData(id: string): void {
        this.adminService.getAdministratorById(id).subscribe({
            next: (admin) => this.populateForm(admin),
            error: (err) => {
                this.toastService.show('Failed to load admin data', 'danger');
                console.error('Error loading admin:', err);
            }
        });
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
            organization: admin.establishmentId
        });

        this.permissionsFormArray.clear();
        this.authorizations.forEach(permission => {
            const hasPermission = admin.permissions?.includes(permission) ?? false;
            const control = new FormControl<boolean>(hasPermission); // 👈 ici aussi
            this.permissionsFormArray.push(control);
        });

        if (this.isEditMode) {
            this.adminForm.get('password')?.clearValidators();
            this.adminForm.get('confirmPassword')?.clearValidators();
            this.adminForm.get('password')?.updateValueAndValidity();
            this.adminForm.get('confirmPassword')?.updateValueAndValidity();
        }
    }

    getSelectedPermissions(): string[] {
        return this.authorizations
            .filter((_, index) => this.permissionsFormArray.at(index).value)
            .map(permission => permission.toString());
    }

    onSubmit(): void {
        if (this.adminForm.valid) {
            const formData = {
                ...this.adminForm.value,
                permissions: this.getSelectedPermissions()
            };

            delete formData.confirmPassword;
            if (this.isEditMode && !formData.password) {
                delete formData.password;
            }

            const operation$ = this.isEditMode
                ? this.adminService.updateAdministrator(formData.id, formData)
                : this.adminService.createAdministrator(formData);

            operation$.subscribe({
                next: () => {
                    const message = this.isEditMode
                        ? 'Admin updated successfully'
                        : 'Admin created successfully';
                    this.toastService.show(message, 'success');
                    this.router.navigate(['/administrators']);
                },
                error: (err) => {
                    const message = this.isEditMode
                        ? 'Failed to update admin'
                        : 'Failed to create admin';
                    this.toastService.show(message, 'danger');
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
                this.toastService.show('Failed to load organizations', 'danger');
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

    cancel(): void {
        this.router.navigate(['/administrators']);
    }
}