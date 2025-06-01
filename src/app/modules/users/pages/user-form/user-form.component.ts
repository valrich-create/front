import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { UserService } from '../../services/user.service';
import {LayoutComponent} from "../../../base-component/components/layout/layout.component";
import {NavbarComponent} from "../../../base-component/components/navbar/navbar.component";
import {UserPermission, UserResponse, UserRole} from "../../users.models";
import {ActivatedRoute, Router} from "@angular/router";
import {ClassServiceService} from "../../../services/class-service.service";
import {OrganizationService} from "../../../organizations/organization.service";

@Component({
	selector: 'app-user-form',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, LayoutComponent, NavbarComponent, NavbarComponent],
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
	permissionsList: UserPermission[] = []; // Exemple de permissions
	rolesWithoutPermissions = ['DELEGATE', 'RELEGATE_DELEGATE', 'TEACHER', 'USER'];
	isEditMode = false;
	currentUserId: string | null = null;

	constructor(
		private fb: FormBuilder,
		private userService: UserService,
		private classServiceService: ClassServiceService,
		private organizationService: OrganizationService,
		private router: Router,
		private route: ActivatedRoute
	) {
		this.createForm();
	}

	async ngOnInit() {
		this.checkEditMode();
		this.getCurrentUserRole();
		await this.getEstablishmentIdFromStorage(); // Attendre la résolution
		this.loadOptions();
		this.setupRoleChangeListener();
		this.permissionsList = Object.values(UserPermission);
	}

	private checkEditMode(): void {
		this.route.params.subscribe(params => {
			if (params['id']) {
				this.isEditMode = true;
				this.currentUserId = params['id'];
				if (this.currentUserId) { // Ajoutez cette vérification
					this.loadUserData(this.currentUserId);
					// Modifiez les validateurs pour le mot de passe en mode édition
					this.userForm.get('password')?.clearValidators();
					this.userForm.get('confirmPassword')?.clearValidators();
					this.userForm.get('password')?.updateValueAndValidity();
					this.userForm.get('confirmPassword')?.updateValueAndValidity();
				}
			}
		});
	}

	private loadUserData(userId: string): void {
		this.userService.getUserById(userId).subscribe({
			next: (user) => {
				this.patchFormWithUserData(user);
			},
			error: (err) => {
				console.error('Failed to load user data', err);
				this.router.navigate(['/users']);
			}
		});
	}

	private patchFormWithUserData(user: UserResponse): void {
		this.userForm.patchValue({
			firstName: user.firstName,
			lastName: user.lastName,
			dateOfBirth: user.dateOfBirth,
			placeOfBirth: user.placeOfBirth,
			role: user.role,
			email: user.email,
			phoneNumber: user.phoneNumber,
			establishmentId: user.establishmentId,
			classServiceId: user.classeServiceId
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
		const storedRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');

		if (storedRole && Object.values(UserRole).includes(storedRole as UserRole)) {
			this.userRole = storedRole as UserRole;

			if (this.userRole === UserRole.SUPER_ADMIN) {
				this.filteredRoles = [UserRole.ADMIN];
			} else {
				this.filteredRoles = this.roles.filter(r => r !== UserRole.SUPER_ADMIN);
			}
		} else {
			console.error('Invalid or missing user role in localStorage or sessionStorage');
			this.userRole = UserRole.ADMIN; // Valeur par défaut
			this.filteredRoles = this.roles.filter(r => r !== UserRole.SUPER_ADMIN);
		}
	}

	// getEstablishmentIdFromStorage() {
	// 	const userData = sessionStorage.getItem('user_data') || localStorage.getItem('user_data');
	//
	// 	if (userData) {
	// 		try {
	// 			const user = JSON.parse(userData);
	// 			this.establishmentId = user.establishment?.id || null;
	//
	// 			if (this.establishmentId) {
	// 				this.userForm.patchValue({
	// 					establishmentId: this.establishmentId
	// 				});
	// 			} else {
	// 				console.warn('No establishment ID found in user data');
	// 			}
	// 		} catch (e) {
	// 			console.error('Error parsing user data from storage', e);
	// 		}
	// 	}
	// }

	getEstablishmentIdFromStorage(): Promise<string | null> {
		return new Promise((resolve) => {
			const userData = sessionStorage.getItem('user_data') || localStorage.getItem('user_data');

			if (userData) {
				try {
					const user = JSON.parse(userData);
					this.establishmentId = user.establishment?.id || null;

					if (this.establishmentId) {
						this.userForm.patchValue({
							establishmentId: this.establishmentId
						});
						resolve(this.establishmentId);
					} else {
						console.warn('No establishment ID found in user data');
						resolve(null);
					}
				} catch (e) {
					console.error('Error parsing user data from storage', e);
					resolve(null);
				}
			} else {
				resolve(null);
			}
		});
	}

	createForm(): void {
		this.userForm = this.fb.group({
			profileImage: [''],
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

	onSubmit(): void {
		if (this.userForm.valid) {
			if (!this.userForm.get('establishmentId')?.value && this.establishmentId) {
				this.userForm.patchValue({ establishmentId: this.establishmentId });
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
						console.log('User updated successfully', response);
						this.router.navigate(['/users']);
					},
					error: (error) => {
						console.error('Error updating user', error);
					}
				});
			} else {
				// Mode création
				this.userService.createUser(formData).subscribe({
					next: (response) => {
						console.log('User created successfully', response);
						this.router.navigate(['/users']);
					},
					error: (error) => {
						console.error('Error creating user', error);
					}
				});
			}

			// this.userService.createUser(formData).subscribe({
			//   next: (response) => {
			//     console.log('User added successfully', response);
			//     console.log('User created successfully');
			//     this.router.navigate(['/users']);
			//   },
			//   error: (error) => {
			//     console.error('Error adding user', error);
			//     postMessage(error);
			//   }
			// });
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
		// Navigate back or reset form
		this.userForm.reset();
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
			this.fieldLabel = 'Classe';
			this.loadClassesForEstablishment();
		}
	}

	private loadEstablishments(): void {
		this.organizationService.getAllEstablishments().subscribe({
			next: (page) => {
				this.options = page.content.map(est => ({
					id: est.id,
					nom: est.nom
				}));
			},
			error: (err) => {
				console.error('Failed to load establishments', err);
			}
		});
	}

	// private loadClassesForEstablishment(): void {
	// 	if (!this.establishmentId) {
	// 		establishmentId = this.getEstablishmentIdFromStorage();
	// 		console.warn('No establishment ID available');
	// 		return;
	// 	}
	//
	// 	this.classServiceService.getClassServicesByEstablishment(this.establishmentId).subscribe({
	// 		next: (classes) => {
	// 			this.options = classes.map(cls => ({
	// 				id: cls.id,
	// 				nom: cls.nom // Utilisez le nom de la classe/service
	// 			}));
	// 		},
	// 		error: (err) => {
	// 			console.error('Failed to load classes/services', err);
	// 		}
	// 	});
	// }

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