import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserResponse } from "../../../users/users.models";
import { Admin } from "../../../administrators/admin";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NavbarComponent } from "../navbar/navbar.component";
import { LayoutComponent } from "../layout/layout.component";
import { AuthService } from "../../../auth/service/auth.service";
import { ToastService } from "../../services/toast/toast.service";
import { firstValueFrom } from "rxjs";

@Component({
	selector: 'app-user-detail-card',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		NavbarComponent,
		LayoutComponent
	],
	templateUrl: 'user-detail-card.component.html',
	styleUrls: ['user-detail-card.component.scss']
})
export class UserDetailCardComponent {
	@Input() user!: UserResponse | Admin | null;
	@Input() isAdmin: boolean = false;
	@Input() pageTitle: string = 'User Details';

	@Input() onEdit?: (user: UserResponse | Admin) => void;
	@Input() onDelete!: (user: UserResponse | Admin) => void;
	@Input() onAssignToClass?: (user: UserResponse | Admin) => void;

	showPasswordResetModal: boolean = false;
	newPassword: string = '';
	passwordError: string = '';
	isSubmitting: boolean = false;
	showPassword: boolean = false;

	private authService = inject(AuthService);
	private router = inject(Router);

	getInitials(): string {
		const firstInitial = this.user?.firstName?.charAt(0) || '';
		const lastInitial = this.user?.lastName?.charAt(0) || '';
		return firstInitial + lastInitial;
	}

	hasProfileImage(): boolean {
		return !!this.user?.profileImageUrl;
	}

	getAssignButtonLabel(): string {
		return this.onAssignToClass?.name === 'changePassword'
			? 'Change Password'
			: 'Assign to Class';
	}

	getAssignButtonIcon(): string {
		return this.onAssignToClass?.name === 'changePassword'
			? 'bi bi-key-fill'
			: 'bi bi-arrow-right-square-fill';
	}

	openPasswordResetModal(): void {
		this.showPasswordResetModal = true;
		this.newPassword = '';
		this.passwordError = '';
		this.isSubmitting = false;
		this.showPassword = false;
	}

	closePasswordResetModal(): void {
		this.showPasswordResetModal = false;
		this.newPassword = '';
		this.passwordError = '';
		this.isSubmitting = false;
		this.showPassword = false;
	}

	togglePasswordVisibility(): void {
		this.showPassword = !this.showPassword;
	}

	validatePassword(password: string): boolean {
		const minLength = 8;
		const hasUpperCase = /[A-Z]/.test(password);
		const hasNumber = /\d/.test(password);
		const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

		if (password.length < minLength) {
			this.passwordError = 'Le mot de passe doit contenir au moins 8 caractères.';
			return false;
		}
		if (!hasUpperCase) {
			this.passwordError = 'Le mot de passe doit contenir au moins une majuscule.';
			return false;
		}
		if (!hasNumber) {
			this.passwordError = 'Le mot de passe doit contenir au moins un chiffre.';
			return false;
		}
		if (!hasSpecialChar) {
			this.passwordError = 'Le mot de passe doit contenir au moins un caractère spécial.';
			return false;
		}

		this.passwordError = '';
		return true;
	}

	onPasswordInput(): void {
		if (this.newPassword) {
			this.validatePassword(this.newPassword);
		} else {
			this.passwordError = '';
		}
	}

	async confirmPasswordReset(): Promise<void> {
		if (!this.user?.id) {
			this.passwordError = 'Utilisateur non valide.';
			return;
		}
		if (!this.newPassword.trim()) {
			this.passwordError = 'Le mot de passe est obligatoire.';
			return;
		}
		if (!this.validatePassword(this.newPassword)) {
			return;
		}

		this.isSubmitting = true;

		try {
			await firstValueFrom(
				this.authService.resetPassword(this.user.id, this.newPassword)
			);
			this.closePasswordResetModal();
		} catch (error) {
			this.passwordError = 'Erreur lors de la réinitialisation du mot de passe.';
		} finally {
			this.isSubmitting = false;
		}
	}

	private getStoredUser(): any {
		const userData = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
		if (!userData) throw new Error('User data not found');
		return JSON.parse(userData);
	}

	handleEdit(): void {
		if (this.onEdit) {
			this.onEdit(this.user!);
			return;
		}

		const currentUser = this.getStoredUser();
		const targetRole = (this.user as any)?.role;
		const targetId = this.user?.id;

		if (!targetRole) {
			console.warn('Rôle de l’utilisateur cible non défini.');
			return;
		}

		if (currentUser.role === 'SUPER_ADMIN') {
			if (targetRole === 'SUPER_ADMIN') {
				this.router.navigate(['/super-admin/edit', targetId]); // Remplace par ta route
			} else if (targetRole === 'ADMIN') {
				this.router.navigate(['/administrators/edit', targetId]); // Remplace par ta route
			} else {
				this.router.navigate(['/organization-admin/edit', targetId]); // Remplace par ta route
			}
		} else if (currentUser.role === 'ADMIN') {
			this.router.navigate(['/organization-admin/edit', targetId]); // Remplace par ta route
		} else {
			console.warn("Rôle non autorisé pour modifier un utilisateur.");
		}
	}
}