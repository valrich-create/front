import {Component, inject, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserResponse } from "../../users.models";
import { ConfirmDialogComponent } from "../../../base-component/components/confirm-dialog/confirm-dialog.component";
import { UserDetailCardComponent } from "../../../base-component/components/user-detail-card/user-detail-card.component";

@Component({
	selector: 'app-user-details',
	standalone: true,
	imports: [CommonModule, UserDetailCardComponent],
	templateUrl: './user-details.component.html',
	styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit {
	private route = inject(ActivatedRoute);
	private router = inject(Router);
	private userService = inject(UserService);
	private modalService = inject(NgbModal);

	user: UserResponse | undefined;

	constructor() {
		// Lie le contexte de la méthode au composant courant
		this.deleteUser = this.deleteUser.bind(this);
		this.editUser = this.editUser.bind(this);
	}

	ngOnInit(): void {
		this.loadUserData();
	}

	private loadUserData(): void {
		const userId = this.route.snapshot.paramMap.get('id');
		if (userId) {
			this.userService.getUserById(userId).subscribe({
				next: (user) => this.user = user,
				error: () => console.error('Failed to load user')
			});
		}
	}

	editUser = (): void => {
		if (this.user?.id) {
			this.router.navigate(['/users/edit', this.user.id]);
		}
	}

	deleteUser = (): void => {
		if (!this.user?.id) return;

		const modalRef = this.modalService.open(ConfirmDialogComponent);
		modalRef.componentInstance.title = 'Confirmer la suppression';
		modalRef.componentInstance.message = `Êtes-vous sûr de vouloir supprimer ${this.user.firstName} ${this.user.lastName} ?`;

		modalRef.result.then((result) => {
			if (result === 'confirm') {
				this.userService.deleteUser(this.user!.id).subscribe({
					next: () => this.router.navigate(['/users']),
					error: (err) => console.error('Erreur lors de la suppression', err)
				});
			}
		}).catch(() => {});
	}

	assignUserToClass = (): void => {
		// Méthode présente dans UserService mais non implémentée ici
		// car nécessite une logique supplémentaire (sélection de classe)
	}

	updateProfileImage(file: File): void {
		if (!this.user?.id) return;

		this.userService.updateProfileImage(this.user.id, file).subscribe({
			next: (updatedUser) => this.user = updatedUser,
			error: (err) => console.error('Erreur mise à jour image', err)
		});
	}

	openAttendanceModal(): void {
		// Ne fait pas partie du UserService
		// Doit être géré par un AttendanceService séparé
	}
}
