import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { OrganizationService } from "../../organization.service";
import { CommonModule } from "@angular/common";
import { FilterTabsComponent } from "../../components/filter-tabs/filter-tabs.component";
import { OrganizationCardComponent } from "../../components/organization-card/organization-card.component";
import { NavbarComponent } from "../../../base-component/components/navbar/navbar.component";
import { LayoutComponent } from "../../../base-component/components/layout/layout.component";
import { Establishment } from "../../organization";
import {SearchBarComponent} from "../../../base-component/components/search-bar/search-bar.component";
import {SortOption} from "../../../users/users.models";

@Component({
	selector: 'app-organizations-list',
	standalone: true,
	imports: [
		CommonModule,
		FilterTabsComponent,
		OrganizationCardComponent,
		NavbarComponent,
		LayoutComponent,
		NavbarComponent,
		SearchBarComponent,
	],
	templateUrl: './organizations-list.component.html',
	styleUrls: ['./organizations-list.component.scss']
})
export class OrganizationsListComponent implements OnInit {
	organizations: Establishment[] = [];
	timePeriods = ['Today', 'Yesterday', 'Last Week', 'Last Month'];
	selectedTimePeriod = 'Today';

	currentPage = 0; // Page index commence à 0 côté backend
	itemsPerPage = 20; // Correspond à la taille par défaut du backend
	totalItems = 0;
	totalPages = 0;

	currentSort: SortOption = 'createdAt';
	currentSearchTerm: string = '';
	sortField = 'nom,asc'; // Tri par défaut

	Math = Math; // Pour utiliser Math dans le template

	constructor(
		private organizationService: OrganizationService,
		private router: Router
	) {}

	ngOnInit(): void {
		this.loadOrganizations();
	}

	loadOrganizations(): void {
		this.organizationService.getAllEstablishments(
			this.currentPage,
			this.itemsPerPage,
			this.sortField
		).subscribe(page => {
			this.organizations = page.content;
			this.totalItems = page.totalElements;
			this.totalPages = page.totalPages;
		});
	}

	handleTimePeriodChange(period: string): void {
		this.selectedTimePeriod = period;
		this.currentPage = 0; // Reset à la première event-form
		this.loadOrganizations();
	}

	navigateToDetail(id: string): void { // UUID est un string
		this.router.navigate(['/organizations', id]);
	}

	goToPage(page: number): void {
		if (page < 0 || page >= this.totalPages) return;
		this.currentPage = page;
		this.loadOrganizations();
	}

	getPageNumbers(): number[] {
		const pageNumbers: number[] = [];
		const pageCount = 5; // Nombre de boutons de pagination à afficher

		let startPage = Math.max(0, this.currentPage - Math.floor(pageCount / 2));
		let endPage = Math.min(this.totalPages - 1, startPage + pageCount - 1);

		// Ajuster si on est près du début ou de la fin
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
		this.currentPage = 0; // Retour à la première event-form quand on change la taille
		this.loadOrganizations();
	}

	onSortChange(field: string): void {
		if (this.sortField.startsWith(field)) {
			const direction = this.sortField.endsWith('asc') ? 'desc' : 'asc';
			this.sortField = `${field},${direction}`;
		} else {
			this.sortField = `${field},asc`;
		}
		this.loadOrganizations();
	}

	onSearchChange(searchTerm: string): void {
		this.currentSearchTerm = searchTerm;
		this.loadOrganizations();
	}
}
