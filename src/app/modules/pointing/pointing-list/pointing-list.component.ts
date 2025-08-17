import {Component, OnDestroy, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {PeriodType, PointageResponse, PointageStatus} from "../../base-component/pointage";
import {PointingResponse} from "../pointing";
import {PointageService} from "../../base-component/services/pointage.service";
import {NavbarComponent} from "../../base-component/components/navbar/navbar.component";
import {LayoutComponent} from "../../base-component/components/layout/layout.component";
import {CommonModule} from "@angular/common";
import {finalize, Subject, takeUntil} from "rxjs";
import {MatPaginatorModule, MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {Router, ActivatedRoute} from '@angular/router';
import {Page} from "../../users/users.models";

type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
	key: keyof PointingResponse;
	direction: SortDirection;
}

interface PaginatedResponse<T> {
	content: T[];
	totalElements: number;
	totalPages: number;
	currentPage: number;
	size: number;
	first: boolean;
	last: boolean;
	numberOfElements: number;
}

@Component({
	selector: 'app-pointing-list',
	imports: [
		NavbarComponent,
		LayoutComponent,
		CommonModule,
		MatPaginatorModule,
		MatProgressSpinnerModule
	],
	standalone: true,
	templateUrl: 'pointing-list.component.html',
	styleUrls: ['pointing-list.component.scss']
})
export class PointingListComponent implements OnInit, OnDestroy, AfterViewInit {
	@ViewChild(MatPaginator) paginator!: MatPaginator;

	pointings: PointageResponse[] = [];
	filteredPointings: PointageResponse[] = [];
	currentDate = new Date();

	pageTitle: string = "Pointage";

	// Configuration du tri
	sortConfig: SortConfig = { key: 'userName', direction: null };

	// Pagination
	currentPage = 0;
	pageSize = 100;
	totalItems = 0;
	pageSizeOptions: number[] = [25, 50, 100, 200];

	// État de chargement
	isLoading = false;
	isPageLoading = false; // Chargement spécifique pour le changement de page
	hasError = false;
	errorMessage = '';

	// Énumération pour le template
	PointageStatus = PointageStatus;

	// Subject pour gérer les souscriptions
	private destroy$ = new Subject<void>();

	constructor(
		private pointageService: PointageService,
		private router: Router,
		private route: ActivatedRoute
	) {}

	async ngOnInit() {
		this.loadQueryParams();
		this.loadTodayPointings();
	}

	ngAfterViewInit() {
		// Configuration du paginator en français
		this.paginator._intl.itemsPerPageLabel = 'Éléments par page :';
		this.paginator._intl.nextPageLabel = 'Page suivante';
		this.paginator._intl.previousPageLabel = 'Page précédente';
		this.paginator._intl.firstPageLabel = 'Première page';
		this.paginator._intl.lastPageLabel = 'Dernière page';
		this.paginator._intl.getRangeLabel = this.getFrenchRangeLabel.bind(this);
	}

	/**
	 * Charge les paramètres de pagination depuis l'URL
	 */
	private loadQueryParams(): void {
		this.route.queryParams.pipe(
			takeUntil(this.destroy$)
		).subscribe(params => {
			this.currentPage = params['page'] ? parseInt(params['page']) : 0;
			this.pageSize = params['size'] ? parseInt(params['size']) : 100;

			// Valider les paramètres
			if (this.currentPage < 0) this.currentPage = 0;
			if (!this.pageSizeOptions.includes(this.pageSize)) {
				this.pageSize = 100;
			}
		});
	}

	/**
	 * Met à jour les paramètres de l'URL
	 */
	private updateUrlParams(): void {
		this.router.navigate([], {
			relativeTo: this.route,
			queryParams: {
				page: this.currentPage,
				size: this.pageSize
			},
			queryParamsHandling: 'merge'
		});
	}

	/**
	 * Charge les pointages avec pagination
	 */
	private loadTodayPointings(): void {
		// Détermine le type de chargement
		const isInitialLoad = this.pointings.length === 0;

		if (isInitialLoad) {
			this.isLoading = true;
		} else {
			this.isPageLoading = true;
		}

		this.hasError = false;

		this.pointageService.getPointagesByEstablishmentPaginated(
			PeriodType.DAY,
			this.currentPage,
			this.pageSize
		).pipe(
			finalize(() => {
				this.isLoading = false;
				this.isPageLoading = false;
			}),
			takeUntil(this.destroy$)
		).subscribe({
			next: (response: Page<PointageResponse>) => {
				this.pointings = response.content;
				this.filteredPointings = [...this.pointings];
				this.totalItems = response.totalElements;

				// Applique le tri s'il y en a un
				if (this.sortConfig.direction) {
					this.applySorting();
				}

				// Met à jour l'URL
				this.updateUrlParams();
			},
			error: (error) => {
				this.hasError = true;
				this.errorMessage = 'Erreur lors du chargement des pointages';
				console.error('Erreur:', error);
			}
		});
	}

	/**
	 * Gère le changement de page via le paginator
	 */
	onPageChange(event: PageEvent): void {
		const previousPage = this.currentPage;
		const previousSize = this.pageSize;

		this.currentPage = event.pageIndex;
		this.pageSize = event.pageSize;

		// Ne recharge que si les paramètres ont changé
		if (previousPage !== this.currentPage || previousSize !== this.pageSize) {
			this.loadTodayPointings();
		}
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
		this.currentPage = 0;
		if (this.paginator) {
			this.paginator.pageIndex = 0;
		}
		this.loadTodayPointings();
	}

	/**
	 * Libelle en français pour le paginator
	 */
	private getFrenchRangeLabel(page: number, pageSize: number, length: number): string {
		if (length === 0 || pageSize === 0) {
			return `0 sur ${length}`;
		}
		length = Math.max(length, 0);
		const startIndex = page * pageSize;
		const endIndex = startIndex < length ?
			Math.min(startIndex + pageSize, length) :
			startIndex + pageSize;
		return `${startIndex + 1} - ${endIndex} sur ${length}`;
	}

	/**
	 * Retourne le statut de chargement global
	 */
	get isAnyLoading(): boolean {
		return this.isLoading || this.isPageLoading;
	}

	/**
	 * Méthode appelée lors de la destruction du composant
	 */
	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}
}