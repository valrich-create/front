import {Component, input, OnInit} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { UserService } from '../../services/user.service';
import {LayoutComponent} from "../../../base-component/components/layout/layout.component";
import {UserPermission, UserResponse, UserRole} from "../../users.models";
import {ActivatedRoute, Router} from "@angular/router";
import {ClassServiceService} from "../../../services/class-service.service";
import {OrganizationService} from "../../../organizations/organization.service";
import {ToastService} from "../../../base-component/services/toast/toast.service";
import {NavbarComponent} from "../../../base-component/components/navbar/navbar.component";

@Component({
	selector: 'app-user-form',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, LayoutComponent, NavbarComponent],
	templateUrl: './user-form.component.html',
	styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
	userForm!: FormGroup;
	roles = Object.values(UserRole);
	userRole: UserRole = UserRole.SUPER_ADMIN;
	filteredRoles: UserRole[] = [];
	fieldLabel = 'Service';
	options: any[] = [];
	previewImageUrl: string | ArrayBuffer | null = null;
	establishmentId: string | null = null;
	showPermissions = false;
	permissionsList: UserPermission[] = [];
	rolesWithoutPermissions = ['DELEGATE', 'RELEGATE_DELEGATE', 'TEACHER', 'USER'];
	isEditMode = false;
	currentUserId: string | null = null;
	showPassword = false;
	showConfirmPassword = false;

	constructor(
		private fb: FormBuilder,
		private userService: UserService,
		private classServiceService: ClassServiceService,
		private organizationService: OrganizationService,
		private toastService: ToastService,
		private router: Router,
		private location: Location,
		private route: ActivatedRoute
	) {
		this.createForm();
	}

	async ngOnInit() {
		try {
			await this.checkEditMode();
			this.getCurrentUserRole();
			await this.getEstablishmentIdFromStorage();
			this.loadOptions();
			this.setupRoleChangeListener();
			this.permissionsList = Object.values(UserPermission);
		} catch (error) {
			console.error('Initialization error:', error);
			this.toastService.warning('Erreur lors de l\'initialisation du formulaire');
		}
	}

	private checkEditMode(): Promise<void> {
		return new Promise((resolve) => {
			this.route.params.subscribe(params => {
				if (params && params['id']) {
					this.isEditMode = true;
					this.currentUserId = params['id'];
					if (this.currentUserId) {
						this.loadUserData(this.currentUserId);
						// Modifier les validateurs
						this.userForm.get('password')?.clearValidators();
						this.userForm.get('confirmPassword')?.clearValidators();
						this.userForm.get('password')?.updateValueAndValidity();
						this.userForm.get('confirmPassword')?.updateValueAndValidity();
					}
				} else {
					this.isEditMode = false;
					this.currentUserId = null;
				}
				resolve();
			});
		});
	}

	private loadUserData(userId: string): void {
		this.userService.getUserById(userId).subscribe({
			next: (user) => {
				this.patchFormWithUserData(user);
			},
			error: (err) => {
				console.error('Failed to load user data', err);
				this.toastService.warning('Impossible de charger les données utilisateur');
				this.router.navigate(['/users']);
			}
		});
	}

	private patchFormWithUserData(user: UserResponse): void {
		const formattedDate = user.dateOfBirth ?
			new Date(user.dateOfBirth).toISOString().split('T')[0] : '';

		this.userForm.patchValue({
			firstName: user.firstName,
			lastName: user.lastName,
			dateOfBirth: formattedDate,
			placeOfBirth: user.placeOfBirth,
			role: user.role,
			email: user.email,
			phoneNumber: user.phoneNumber,
			establishmentId: user.establishmentId || '',
			classServiceId: user.classeServiceId || ''
		});

		if (user.profileImageUrl) {
			this.previewImageUrl = user.profileImageUrl;
		}

		// Gestion des permissions si nécessaire
		if (user.permissions && this.userForm.get('permissions')) {
			const permissionsGroup = this.userForm.get('permissions') as FormGroup;
			user.permissions.forEach(permission => {
				if (permissionsGroup.get(permission)) {
					permissionsGroup.get(permission)?.setValue(true);
				}
			});
		}
	}

	getCurrentUserRole() {
		// Récupérer les données utilisateur complètes
		const userData = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');

		if (userData) {
			try {
				const user = JSON.parse(userData);
				const storedRole = user.role; // Lire le rôle depuis l'objet user

				if (storedRole && Object.values(UserRole).includes(storedRole as UserRole)) {
					this.userRole = storedRole as UserRole;

					if (this.userRole === UserRole.SUPER_ADMIN) {
						this.filteredRoles = [UserRole.ADMIN];
					} else {
						this.filteredRoles = this.roles.filter(r => r !== UserRole.SUPER_ADMIN);
					}
					return; // Sortir si tout est bon
				}
			} catch (e) {
				console.error('Error parsing user data', e);
			}
		}

		// Fallback si erreur ou données manquantes
		console.error('Invalid or missing user role in storage');
		this.userRole = UserRole.ADMIN;
		this.filteredRoles = this.roles.filter(r => r !== UserRole.SUPER_ADMIN);
	}

	getEstablishmentIdFromStorage(): Promise<string | null> {
		return new Promise((resolve) => {
			const userData = sessionStorage.getItem('user_data') || localStorage.getItem('user_data');

			if (userData) {
				try {
					const user = JSON.parse(userData);
					this.establishmentId = user.establishment?.id ||
						user.establishmentId ||
						null;

					if (this.establishmentId) {
						this.userForm.patchValue({
							establishmentId: this.establishmentId
						});
						resolve(this.establishmentId);
					} else {
						console.warn('No establishment ID found in user data');
						this.toastService.error("Impossible de lire votre organisation")
						resolve(null);
					}
				} catch (e) {
					console.error('Error parsing user data from storage', e);
					this.toastService.error("Impossible de lire votre organisation")
					resolve(null);
				}
			} else {
				resolve(null);
			}
		});
	}

	createForm(): void {
		this.userForm = this.fb.group({
			profileImage: ['', Validators.required],
			firstName: ['', Validators.required],
			lastName: ['', Validators.required],
			dateOfBirth: ['', Validators.required],
			placeOfBirth: ['', Validators.required],
			role: ['', Validators.required],
			email: ['', [Validators.required, Validators.email]],
			phoneNumber: ['', Validators.required],
			address: ['', [Validators.maxLength(1000)]],
			establishmentId: [''],
			classServiceId: [''],
			password: ['', [
				Validators.required,
				Validators.minLength(8),
				this.passwordValidator
			]],
			confirmPassword: ['', Validators.required]
		}, { validators: this.passwordMatchValidator });
	}

	passwordMatchValidator(form: FormGroup) {
		const password = form.get('password')?.value;
		const confirmPassword = form.get('confirmPassword')?.value;

		return password === confirmPassword ? null : { passwordMismatch: true };
	}

	togglePasswordVisibility(field: 'password' | 'confirmPassword') {
		if (field === 'password') {
			this.showPassword = !this.showPassword;
		} else {
			this.showConfirmPassword = !this.showConfirmPassword;
		}
	}

	onSubmit(): void {
		if (this.userForm.valid) {
			if (!this.userForm.get('establishmentId')?.value && this.establishmentId) {
				this.userForm.patchValue({ establishmentId: this.establishmentId });
			}
			const phoneNumber = this.userForm.get('phoneNumber')?.value;
			if (phoneNumber) {
				this.userForm.patchValue({
					phoneNumber: this.cleanPhoneNumber(phoneNumber)
				});
			}
			const profileImage = this.userForm.get('profileImage')?.value;
			if (!profileImage || !(profileImage instanceof File)) {
				this.toastService.error('Veuillez sélectionner une image de profil.');
				return;
			}

			const formData = new FormData();
			const formValue = {
				...this.userForm.value,
				permissions: this.getSelectedPermissions(),
				classServiceId: this.userForm.value.classServiceId
			};

			if (formValue.profileImage instanceof File) {
				formData.append('profileImage', formValue.profileImage, formValue.profileImage.name);
			}

			// Ajouter tous les champs sauf confirmPassword
			Object.keys(formValue).forEach(key => {
				if (key !== 'confirmPassword') {
					const value = formValue[key];

					if (value !== null && value !== undefined) {
						if (key === 'profileImage' && value instanceof File) {
							formData.append(key, value, value.name);
						} else if (key === 'dateOfBirth') {
							const dateValue = new Date(value);
							if (!isNaN(dateValue.getTime())) {
								formData.append(key, dateValue.toISOString().split('T')[0]);
							}
						} else if (key === 'permissions') {
							(value as string[]).forEach(permission => {
								formData.append('permissions', permission);
							});
						} else if (key !== 'profileImage') {
							formData.append(key, value.toString());
						} else {
							formData.append(key, value.toString());
						}
					}
				}
			});

			if (this.isEditMode && this.currentUserId) {
				// Mode édition
				this.userService.updateUser(this.currentUserId, formData).subscribe({
					next: (response) => {
						this.toastService.success('Operation reussie!');
						this.router.navigate(['/users']);
					},
					error: (error) => {
						this.toastService.error(error.error.message || error.message);
						console.error('Error updating user', error);
					}
				});
			} else {
				// Mode création
				this.userService.createUser(formData).subscribe({
					next: (response) => {
						this.toastService.success('Operation reussie!');
						console.log('User created successfully', response);
						this.router.navigate(['/users']);
					},
					error: (error) => {
						this.toastService.error(error.error.message || error.message);
						console.error('Error creating user', error);
					}
				});
			}
		} else {
			this.markFormGroupTouched(this.userForm);
		}
	}

	setupRoleChangeListener() {
		this.userForm.get('role')?.valueChanges.subscribe(role => {
			this.showPermissions = role && !this.rolesWithoutPermissions.includes(role);

			// Initialiser les permissions si nécessaire
			if (this.showPermissions) {
				this.initPermissions();
			}
		});
	}

	initPermissions() {
		// Crée un FormGroup pour les permissions si non existant
		if (!this.userForm.get('permissions')) {
			const permissionsGroup = this.fb.group({});
			this.permissionsList.forEach(permission => {
				permissionsGroup.addControl(permission, this.fb.control(false));
			});
			this.userForm.addControl('permissions', permissionsGroup);
		}
	}

	getSelectedPermissions(): string[] {
		if (!this.userForm.get('permissions')) {
			return [""];
		}

		const permissionsFormGroup = this.userForm.get('permissions') as FormGroup;
		return Object.keys(permissionsFormGroup.controls)
			.filter(key => permissionsFormGroup.get(key)?.value);
	}

	markFormGroupTouched(formGroup: FormGroup) {
		Object.values(formGroup.controls).forEach(control => {
			control.markAsTouched();
			if ((control as FormGroup).controls) {
				this.markFormGroupTouched(control as FormGroup);
			}
		});
	}

	onCancel(): void {
		this.userForm.reset();
		if (window.history.length > 1) {
			window.history.back();
		} else {
			this.location.back();
		}
	}

	onFileSelected(event: Event): void {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			const file = input.files[0];

			// Mettre à jour le formulaire
			this.userForm.patchValue({ profileImage: file });

			// Créer l'URL de preview
			const reader = new FileReader();
			reader.onload = () => {
				this.previewImageUrl = reader.result;
			};
			reader.readAsDataURL(file);
		}
	}

	async loadOptions() {
		if (this.userRole === UserRole.SUPER_ADMIN) {
			this.fieldLabel = 'Établissement';
			this.loadEstablishments();
		} else {
			this.fieldLabel = 'Classe/Service';
			this.loadClassesForEstablishment();
		}
	}

	private loadEstablishments(): void {
		this.organizationService.getAllEstablishments().subscribe({
			next: (page) => {
				this.options = page.content.map(est => ({
					id: est.id,
					name: est.nom
				}));
			},
			error: (err) => {
				console.error('Failed to load establishments', err);
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

	private async loadClassesForEstablishment(): Promise<void> {
		if (!this.establishmentId) {
			console.warn('No establishment ID available');
			this.options = [];
			return;
		}

		try {
			const classes = await this.classServiceService.getClassServicesByEstablishment(this.establishmentId)
				.toPromise()
				.then(response => response || []);

			this.options = classes.map(cls => ({
				id: cls.id,
				name: cls.nom
			}));
		} catch (err) {
			console.error('Failed to load classes/services', err);
			this.options = [];
		}
	}

	passwordValidator(control: FormControl) {
		const value = control.value || '';
		const hasNumber = /[0-9]/.test(value);
		const hasUpper = /[A-Z]/.test(value);
		const hasLower = /[a-z]/.test(value);
		const hasSpecial = /[@#$%^&+=]/.test(value);
		const validLength = value.length >= 8;
		const hasWhitespace = /\s/.test(value);

		const errors = [];
		if (!hasNumber) errors.push('1 chiffre');
		if (!hasUpper) errors.push('1 majuscule');
		if (!hasLower) errors.push('1 minuscule');
		if (!hasSpecial) errors.push('1 caractère spécial (@#$%^&+=)');
		if (!validLength) errors.push('8 caractères minimum');
		if (hasWhitespace) errors.push('pas d\'espaces');

		return errors.length === 0 ? null : {
			passwordRequirements: `Le mot de passe doit contenir: ${errors.join(', ')}`
		};
	}
}