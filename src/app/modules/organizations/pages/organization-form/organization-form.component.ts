import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {LayoutComponent} from "../../../base-component/components/layout/layout.component";
import {NavbarComponent} from "../../../base-component/components/navbar/navbar.component";
import {NgClass, NgIf} from "@angular/common";
import {Establishment, EstablishmentRequest, EstablishmentUpdateRequest} from "../../organization";
import {ActivatedRoute, Router} from "@angular/router";
import {OrganizationService} from "../../organization.service";
import {ToastService} from "../../../base-component/services/toast/toast.service";

@Component({
	selector: 'app-organization-form',
	standalone: true,
	imports: [
		FormsModule,
		LayoutComponent,
		NavbarComponent,
		NgIf,
		ReactiveFormsModule,
		NgClass
	],
	templateUrl: 'organization-form.component.html',
	styleUrls: ['organization-form.component.scss']
})

export class OrganizationFormComponent implements OnInit {
	establishmentForm: FormGroup;
	isEditMode = false;
	establishmentId: string | null = null;
	superAdminId: string | null = null;

	constructor(
		private fb: FormBuilder,
		private organizationService: OrganizationService,
		private toastService: ToastService,
		private router: Router,
		private route: ActivatedRoute
	) {
		this.establishmentForm = this.fb.group({
			nom: ['', Validators.required],
			adresse: ['', Validators.required],
			codePostal: ['', Validators.required],
			ville: ['', Validators.required],
			pays: ['', Validators.required],
			telephone: ['', [Validators.required, this.cameroonPhoneValidator]],
			email: ['', [Validators.email]],
			logoUrl: [''],
			nombreMaxUtilisateurs: [1, [Validators.required, Validators.min(1)]]
		});
	}

	ngOnInit(): void {
		this.establishmentId = this.route.snapshot.paramMap.get('id');
		this.isEditMode = !!this.establishmentId;
		this.getSuperAdminIdFromStorage();

		if (this.isEditMode) {
			this.loadEstablishmentData();
			this.getSuperAdminIdFromStorage();
			// Remove required validator for superAdminId in edit mode
			this.establishmentForm.get('superAdminId')?.clearValidators();
			this.establishmentForm.get('superAdminId')?.updateValueAndValidity();
		}
	}

	cameroonPhoneValidator(control: any) {
		if (!control.value) return null;
		const phoneRegex = /^\+237[0-9]{9}$/;
		return phoneRegex.test(control.value) ? null : { invalidPhone: true };
	}

	loadEstablishmentData(): void {
		if (this.establishmentId) {
			this.organizationService.getEstablishmentById(this.establishmentId).subscribe({
				next: (establishment: Establishment) => {
					this.establishmentForm.patchValue({
						nom: establishment.nom,
						adresse: establishment.adresse,
						codePostal: establishment.codePostal,
						ville: establishment.ville,
						pays: establishment.pays,
						telephone: establishment.telephone,
						email: establishment.email,
						logoUrl: establishment.logoUrl,
						nombreMaxUtilisateurs: establishment.nombreMaxUtilisateurs
					});
				},
				error: (error) => {
					console.error('Error loading establishment:', error);
					// Handle error (show toast, etc.)
				}
			});
		}
	}

	isFieldInvalid(fieldName: string): boolean {
		const field = this.establishmentForm.get(fieldName);
		return field ? (field.invalid && (field.dirty || field.touched)) : false;
	}

	getFieldErrorMessage(fieldName: string): string {
		const field = this.establishmentForm.get(fieldName);
		if (field?.errors && (field.dirty || field.touched)) {
			if (field.errors['required']) {
				switch (fieldName) {
					case 'nom': return 'Le nom de l\'établissement est obligatoire';
					case 'adresse': return 'L\'adresse est obligatoire';
					case 'codePostal': return 'Le code postal est obligatoire';
					case 'ville': return 'La ville est obligatoire';
					case 'pays': return 'Le pays est obligatoire';
					case 'telephone': return 'Le numéro de téléphone est obligatoire';
					case 'nombreMaxUtilisateurs': return 'Le nombre maximum d\'utilisateurs est obligatoire';
					default: return 'Ce champ est obligatoire';
				}
			}
			if (field.errors['email']) {
				return 'Veuillez saisir une adresse email valide';
			}
			if (field.errors['invalidPhone']) {
				return 'Numéro invalide, utilisez le format +237 6XX XXX XXX';
			}
			if (field.errors['min']) {
				return 'Veuillez saisir un nombre valide (minimum 1)';
			}
		}
		return '';
	}

	onSubmit(): void {
		if (this.establishmentForm.valid) {
			const formValue = this.establishmentForm.value;

			const cleanedData = {
				...formValue,
				email: formValue.email?.trim() || null,
				logoUrl: formValue.logoUrl?.trim() || null
			};

			if (this.isEditMode && this.establishmentId) {
				const updateRequest: EstablishmentUpdateRequest = cleanedData;
				this.organizationService.updateEstablishment(this.establishmentId, updateRequest).subscribe({
					next: () => {
						this.toastService.success('Mise à jour réussie!');
						this.router.navigate(['/establishments']);
					},
					error: (error) => {
						console.error('Une erreur est survenue:', error);
						this.toastService.error(error.error.message || error.message);
						// Handle error
					}
				});
			} else {
				const createRequest: EstablishmentRequest = cleanedData;
				this.organizationService.createEstablishment(createRequest).subscribe({
					next: () => {
						this.toastService.success("Organisation créée avec succès!");
						this.router.navigate(['/establishments']);
					},
					error: (error) => {
						this.toastService.error(error.error.message || error.message);
						console.error('Error creating establishment:', error);
						// Handle error
					}
				});
			}
		} else {
			// Mark all fields as touched to display validation errors
			Object.keys(this.establishmentForm.controls).forEach(key => {
				const control = this.establishmentForm.get(key);
				control?.markAsTouched();
			});
		}
	}

	onCancel(): void {
		this.router.navigate(['/establishments']);
	}

	getSuperAdminIdFromStorage() {
		const userData = sessionStorage.getItem('user_data') || localStorage.getItem('user_data');

		if (!userData) {
			console.warn('No user data found in storage');
			return;
		}

		try {
			const user = JSON.parse(userData);

			if (user.role === 'SUPER_ADMIN') {
				this.superAdminId = user.id;

				// Ajout conditionnel au formulaire seulement si en mode création
				if (!this.isEditMode) {
					this.establishmentForm.addControl('superAdminId',
						this.fb.control(this.superAdminId, Validators.required));
				} else {
					// En mode édition, on peut juste patcher la valeur si nécessaire
					this.establishmentForm.patchValue({
						superAdminId: this.superAdminId
					});
				}
			} else {
				console.warn('User is not a SUPER_ADMIN');
				this.superAdminId = null;
			}
		} catch (e) {
			console.error('Error parsing user data from storage', e);
			this.superAdminId = null;
		}
	}
}