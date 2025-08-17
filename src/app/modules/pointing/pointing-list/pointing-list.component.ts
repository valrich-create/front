import {Component, OnDestroy, OnInit} from '@angular/core';
import {PeriodType, PointageResponse, PointageStatus} from "../../base-component/pointage";
import {PointingResponse} from "../pointing";
import {PointageService} from "../../base-component/services/pointage.service";
import {NavbarComponent} from "../../base-component/components/navbar/navbar.component";
import {LayoutComponent} from "../../base-component/components/layout/layout.component";
import {CommonModule} from "@angular/common";
import {finalize} from "rxjs";

type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
	key: keyof PointingResponse;
	direction: SortDirection;
}

@Component({
	selector: 'app-pointing-list',
	imports: [
		NavbarComponent,
		LayoutComponent,
		CommonModule
	],
	standalone: true,
	templateUrl: 'pointing-list.component.html',
	styleUrls: ['pointing-list.component.scss']
})
export class PointingListComponent implements OnInit, OnDestroy {
	pointings: PointageResponse[] = [];
	filteredPointings: PointageResponse[] = [];
	currentDate = new Date(); // Ajoutez cette propriété

	pageTitle: string = "Pointage";
	// Configuration du tri
	sortConfig: SortConfig = { key: 'userName', direction: null };

	// Pagination
	currentPage = 0;
	pageSize = 10;
	totalItems = 0;

	// État de chargement
	isLoading = false;
	hasError = false;
	errorMessage = '';

	// Énumération pour le template
	PointageStatus = PointageStatus;

	constructor(
		private pointageService: PointageService
	) {}

	async ngOnInit() {
		this.loadTodayPointings();
	}

	private loadTodayPointings(): void {
		this.isLoading = true;
		this.hasError = false;

		this.pointageService.getPointagesByEstablishmentPaginated(
			PeriodType.DAY,
			this.currentPage,
			this.pageSize
		).pipe(
			finalize(() => this.isLoading = false)
		).subscribe({
			next: (response) => {
				this.pointings = response.content;
				this.filteredPointings = [...this.pointings];
				this.totalItems = response.totalElements;
			},
			error: (error) => {
				this.hasError = true;
				this.errorMessage = 'Erreur lors du chargement des pointages';
				console.error('Erreur:', error);
			}
		});
	}

	/**
	 * Gère le changement de page
	 */
	onPageChange(page: number): void {
		this.currentPage = page;
		this.loadTodayPointings();
	}

	/**
	 * Gère le tri des colonnes
	 */
	onSort(column: keyof PointingResponse): void {
		if (this.sortConfig.key === column) {
			// Cycle: asc -> desc -> null -> asc
			if (this.sortConfig.direction === 'asc') {
				this.sortConfig.direction = 'desc';
			} else if (this.sortConfig.direction === 'desc') {
				this.sortConfig.direction = null;
			} else {
				this.sortConfig.direction = 'asc';
			}
		} else {
			// Nouveau tri sur une autre colonne
			this.sortConfig.key = column;
			this.sortConfig.direction = 'asc';
		}

		this.applySorting();
	}

	/**
	 * Applique le tri aux données
	 */
	private applySorting(): void {
		if (!this.sortConfig.direction) {
			// Aucun tri, retour à l'ordre original
			this.filteredPointings = [...this.pointings];
			return;
		}

		this.filteredPointings.sort((a, b) => {
			const aValue = a[this.sortConfig.key];
			const bValue = b[this.sortConfig.key];

			let comparison = 0;

			if (aValue < bValue) {
				comparison = -1;
			} else if (aValue > bValue) {
				comparison = 1;
			}

			return this.sortConfig.direction === 'desc' ? comparison * -1 : comparison;
		});
	}

	/**
	 * Détermine l'icône de tri à afficher
	 */
	getSortIcon(column: keyof PointingResponse): string {
		if (this.sortConfig.key !== column) {
			return 'sort';
		}

		switch (this.sortConfig.direction) {
			case 'asc':
				return 'sort-up';
			case 'desc':
				return 'sort-down';
			default:
				return 'sort';
		}
	}

	/**
	 * Retourne la classe CSS pour le statut
	 */
	getStatusClass(status: PointageStatus): string {
		switch (status) {
			case PointageStatus.PENDING:
				return 'status-pending';
			case PointageStatus.SUCCEED:
				return 'status-completed';
			case PointageStatus.FAILED:
				return 'status-failed';
			case PointageStatus.CONFIRMED:
				return 'status-confirmed';
			default:
				return '';
		}
	}

	/**
	 * Formate l'heure au format HH:mm
	 */
	formatTime(time: string): string {
		return time;
	}

	/**
	 * Formate la date et l'heure au format dd/MM/yyyy HH:mm
	 */
	formatDateTime(date: Date): string {
		const d = new Date(date);
		const day = d.getDate().toString().padStart(2, '0');
		const month = (d.getMonth() + 1).toString().padStart(2, '0');
		const year = d.getFullYear();
		const hours = d.getHours().toString().padStart(2, '0');
		const minutes = d.getMinutes().toString().padStart(2, '0');

		return `${day}/${month}/${year} ${hours}:${minutes}`;
	}

	/**
	 * Formate les coordonnées avec précision limitée
	 */
	formatCoordinate(coordinate: number): string {
		return coordinate.toFixed(6);
	}

	/**
	 * Fonction trackBy pour optimiser le rendu des listes
	 */
	trackByPointingId(index: number, pointing: PointingResponse): string {
		return pointing.id;
	}

	/**
	 * Recharge les données
	 */
	onRefresh(): void {
		this.loadTodayPointings();
	}

	/**
	 * Méthode appelée lors de la destruction du composant
	 * À utiliser pour nettoyer les souscriptions si nécessaire
	 */
	ngOnDestroy(): void {
		// TODO: Implémenter le nettoyage des souscriptions si nécessaire
		// Example: this.subscription?.unsubscribe();
	}
}