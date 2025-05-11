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
    FormArray
} from '@angular/forms';
import { LayoutComponent } from "../../../base-component/components/layout/layout.component";
import { NavbarComponent } from "../../../base-component/components/navbar/navbar.component";
import { UserPermission, UserRole } from "../../../users/users.models";
import { Establishment } from "../../../organizations/organization";
import { OrganizationService } from "../../../organizations/organization.service";
import { Admin } from "../../admin";
import { ActivatedRoute, Router } from "@angular/router";
import { AdministratorServiceService } from "../../services/administrator-service.service";

@Component({
    selector: 'app-admin-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, LayoutComponent, NavbarComponent],
    templateUrl: 'admin-form.component.html',
    styleUrls: ['admin-form.component.scss']
})
export class AdminFormComponent implements OnInit {
    @Input() adminData: Admin | null = null;
    isEditMode = false;

    adminForm!: FormGroup;
    organizations: Establishment[] = [];
    maxBirthDate = new Date();
    roles = Object.values(UserRole);
    authorizations = Object.values(UserPermission);
    characterCount: number = 0;
    maxCharacters: number = 2000;
    permissionsFormArray!: FormArray;

    constructor(
        private fb: FormBuilder,
        private organizationService: OrganizationService,
        private route: ActivatedRoute,
        private adminService: AdministratorServiceService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.initForm();
        this.loadOrganizations();

        const adminId = this.route.snapshot.paramMap.get('id');
        if (adminId) {
            this.isEditMode = true;
            this.loadAdminData(adminId);
        }
    }

    initForm(): void {
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
            permissions: this.fb.array(this.createPermissionsControls())
        }, { validators: this.passwordMatchValidator });

        this.permissionsFormArray = this.adminForm.get('permissions') as FormArray;
    }

    createPermissionsControls(): AbstractControl[] {
        return this.authorizations.map(() => this.fb.control(false));
    }

    loadAdminData(id: string): void {
        this.adminService.getAdministratorById(id).subscribe(admin => {
            this.populateForm(admin);
        });
    }

    populateForm(admin: Admin): void {
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
            role: admin.role
        });

        // Set permissions
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

            if (this.isEditMode) {
                formData.id = this.adminData?.id;
                this.adminService.updateAdministrator(formData.id, formData)
                    .subscribe({
                        next: () => this.router.navigate(['/administrators']),
                        error: (err) => console.error('Update failed:', err)
                    });
            } else {
                this.adminService.createAdministrator(formData)
                    .subscribe({
                        next: () => this.router.navigate(['/administrators']),
                        error: (err) => console.error('Creation failed:', err)
                    });
            }
        } else {
            this.markFormGroupTouched(this.adminForm);
        }
    }

    loadOrganizations(): void {
        this.organizationService.getAllEstablishmentList().subscribe(
            orgs => this.organizations = orgs
        );
    }

    passwordMatchValidator(g: FormGroup) {
        const password = g.get('password')?.value;
        const confirmPassword = g.get('confirmPassword')?.value;
        return password === confirmPassword ? null : { 'mismatch': true };
    }

    validateDateNotInFuture(control: AbstractControl): ValidationErrors | null {
        if (!control.value) return null;
        const selectedDate = new Date(control.value);
        const today = new Date();
        return selectedDate > today ? { futureDate: true } : null;
    }

    updateCharCount(event: any): void {
        this.characterCount = event.target.value.length;
    }

    markFormGroupTouched(formGroup: FormGroup) {
        Object.values(formGroup.controls).forEach(control => {
            control.markAsTouched();
            if (control instanceof FormGroup) {
                this.markFormGroupTouched(control);
            } else if (control instanceof FormArray) {
                control.controls.forEach(arrayControl => {
                    this.markFormGroupTouched(arrayControl as FormGroup);
                });
            }
        });
    }

    cancel(): void {
        this.router.navigate(['/administrators']);
    }
}