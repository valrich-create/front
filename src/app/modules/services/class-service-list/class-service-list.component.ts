import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { ClassServiceService } from "../class-service.service";
import { CommonModule } from "@angular/common";
import {FilterTabsComponent} from "../../organizations/components/filter-tabs/filter-tabs.component";
import {ClassServiceCardComponent} from "../class-service-card/class-service-card.component";
import {NavbarComponent} from "../../base-component/components/navbar/navbar.component";
import {LayoutComponent} from "../../base-component/components/layout/layout.component";
import {SearchBarComponent} from "../../base-component/components/search-bar/search-bar.component";
import {ClassServiceResponse} from "../class-service";
import {SortOption} from "../../users/users.models";

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

	currentPage = 0;
	itemsPerPage = 20;
	totalItems = 0;
	totalPages = 0;

	currentSort: SortOption = 'createdAt';
	currentSearchTerm: string = '';
	sortField = 'nom,asc';

	Math = Math;

	constructor(
		private classServiceService: ClassServiceService,
		private router: Router
	) {}

	ngOnInit(): void {
		this.loadClassServices();
	}

	loadClassServices(): void {
		this.classServiceService.getAllClassServices().subscribe(classes => {
			// Note: Adaptez selon votre API si vous avez une pagination côté backend
			this.classServices = classes;
			this.totalItems = classes.length;
			this.totalPages = Math.ceil(classes.length / this.itemsPerPage);
		});
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
		// Implémentez la logique de tri si nécessaire
		this.loadClassServices();
	}

	onSearchChange(searchTerm: string): void {
		this.currentSearchTerm = searchTerm;
		// Implémentez la logique de recherche si nécessaire
		this.loadClassServices();
	}
}
