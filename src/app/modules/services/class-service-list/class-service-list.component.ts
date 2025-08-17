import { Component, OnInit } from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import { ClassServiceService } from "../class-service.service";
import { CommonModule } from "@angular/common";
import { FilterTabsComponent } from "../../organizations/components/filter-tabs/filter-tabs.component";
import { ClassServiceCardComponent } from "../class-service-card/class-service-card.component";
import { NavbarComponent } from "../../base-component/components/navbar/navbar.component";
import { LayoutComponent } from "../../base-component/components/layout/layout.component";
import { SearchBarComponent } from "../../base-component/components/search-bar/search-bar.component";
import { ClassServiceResponse } from "../class-service";
import { SortOption } from "../../users/users.models";
import { UserService } from "../../users/services/user.service";
import { ToastService } from "../../base-component/services/toast/toast.service";

@Component({
	selector: 'app-class-service-list',
	standalone: true,
	imports: [
		CommonModule,
		FilterTabsComponent,
		ClassServiceCardComponent,
		NavbarComponent,
		LayoutComponent,
		SearchBarComponent,
	],
	templateUrl: './class-service-list.component.html',
	styleUrls: ['./class-service-list.component.scss']
})
export class ClassServiceListComponent implements OnInit {
	classServices: ClassServiceResponse[] = [];
	timePeriods = ['Today', 'Yesterday', 'Last Week', 'Last Month'];
	selectedTimePeriod = 'Today';
	currentEstablishmentId: string | undefined ;
	loading = false;

	currentPage = 0;
	itemsPerPage = 20;
	totalItems = 0;
	totalPages = 0;
	private loadingTimeout: any;

	currentSort: SortOption = 'createdAt';
	currentSearchTerm: string = '';
	sortField = 'nom,asc';
	errorMessage: string | null = null;

	Math = Math;

	constructor(
		private classServiceService: ClassServiceService,
		private userService: UserService,
		private toastService: ToastService,
		private router: Router
	) {}

	ngOnInit(): void {
		this.loadCurrentUserAndEstablishment();
	}

	ngOnDestroy(): void {
		this.clearLoadingTimeout();
	}

	private loadCurrentUserAndEstablishment(): void {
		this.loading = true;
		this.errorMessage = null;
		this.toastService.info('Chargement des donnees...');

		this.userService.getCurrentUser().subscribe({
			next: (user) => {
				this.currentEstablishmentId = user.establishmentId;
				if (!this.currentEstablishmentId) {
					this.forceStopLoading();
					this.errorMessage = 'Your account is not associated with any establishment. Please contact your administrator.';
					this.classServices = []; // Clear any existing data
					return;
				}
				this.loadClassServices();
				if (this.classServices.length === 0) {
					this.loading = false;
					this.forceStopLoading();
				}
			},
			error: (err) => {
				this.handleError('Failed to load user data', err);
				this.loading = false;
				this.forceStopLoading();
			}
		});
	}

	loadClassServices(): void {
		if (!this.currentEstablishmentId) {
			this.errorMessage = 'No establishment ID available';
			this.loading = false;
			this.forceStopLoading();
			return;
		}

		this.loading = true;
		this.toastService.info('Chargement des classes/services...');

		this.classServiceService.getClassServicesByEstablishment(this.currentEstablishmentId).subscribe({
			next: (classes) => {
				this.classServices = classes;
				this.totalItems = classes.length;
				this.totalPages = Math.ceil(classes.length / this.itemsPerPage);
				this.loading = false;
				this.forceStopLoading();
				this.toastService.success(`${classes.length} class services loaded`);
			},
			error: (err) => {
				this.handleError('Failed to load class services', err);
				this.loading = false;
				this.forceStopLoading();
			},
			complete: () => {
				this.loading = false;
				this.forceStopLoading();
			}
		});
	}

	private handleError(context: string, error: unknown): void {
		this.loading = false;
		this.forceStopLoading();
		let errorMessage = 'An unknown error occurred';

		if (error instanceof Error) {
			errorMessage = error.message;
		} else if (typeof error === 'string') {
			errorMessage = error;
		}

		console.error(`${context}:`, error);
		console.error(`${context}:`, error);
		this.toastService.error(`${context}: ${errorMessage}`);
	}

	handleTimePeriodChange(period: string): void {
		this.selectedTimePeriod = period;
		this.currentPage = 0;
		this.loadClassServices();
	}

	navigateToDetail(id: string): void {
		this.router.navigate(['/class-services', id]);
	}

	goToPage(page: number): void {
		if (page < 0 || page >= this.totalPages) return;
		this.currentPage = page;
		this.loadClassServices();
	}

	getPageNumbers(): number[] {
		const pageNumbers: number[] = [];
		const pageCount = 5;

		let startPage = Math.max(0, this.currentPage - Math.floor(pageCount / 2));
		let endPage = Math.min(this.totalPages - 1, startPage + pageCount - 1);

		if (endPage - startPage + 1 < pageCount) {
			if (this.currentPage < Math.floor(pageCount / 2)) {
				endPage = Math.min(pageCount - 1, this.totalPages - 1);
			} else {
				startPage = Math.max(0, endPage - pageCount + 1);
			}
		}

		for (let i = startPage; i <= endPage; i++) {
			pageNumbers.push(i);
		}

		return pageNumbers;
	}

	changeItemsPerPage(size: number): void {
		this.itemsPerPage = size;
		this.currentPage = 0;
		this.loadClassServices();
	}

	onSortChange(field: string): void {
		if (this.sortField.startsWith(field)) {
			const direction = this.sortField.endsWith('asc') ? 'desc' : 'asc';
			this.sortField = `${field},${direction}`;
		} else {
			this.sortField = `${field},asc`;
		}
		this.loadClassServices();
	}

	onSearchChange(searchTerm: string): void {
		this.currentSearchTerm = searchTerm;
		this.loadClassServices();
	}

	protected readonly length = length;

	private forceStopLoading(): void {
		this.clearLoadingTimeout();
		this.loading = false;
		// Forcer la détection de changement au cas où
		setTimeout(() => this.loading = false, 0);
	}

	private clearLoadingTimeout(): void {
		if (this.loadingTimeout) {
			clearTimeout(this.loadingTimeout);
		}
	}
}