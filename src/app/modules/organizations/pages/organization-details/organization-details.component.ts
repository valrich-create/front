import {Component, Input, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {ClassStatsCardsComponent} from "../../components/class-stats-cards/class-stats-cards.component";
import {ClassUsersListComponent} from "../../components/class-users-list/class-users-list.component";
import {
	ClassPresenceClassementComponent
} from "../../components/class-presence-classement/class-presence-classement.component";
import {
	ClassPresenceBalanceComponent,
	FilterOption
} from "../../components/class-presence-balance/class-presence-balance.component";
import {NavbarComponent} from "../../../base-component/components/navbar/navbar.component";
import {LayoutComponent} from "../../../base-component/components/layout/layout.component";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {finalize, forkJoin, Observable, switchMap} from "rxjs";
import {ClassServiceService} from "../../../services/class-service.service";
import {PointageService} from "../../../base-component/services/pointage.service";
import {UserPresenceRankingResponse} from "../../../base-component/pointage";
import {ActivatedRoute} from "@angular/router";

@Component({
	selector: 'app-organization-details',
	standalone: true,
	imports: [
		CommonModule,
		ClassStatsCardsComponent,
		ClassPresenceClassementComponent,
		ClassUsersListComponent,
		ClassPresenceBalanceComponent,
		FontAwesomeModule,
		NavbarComponent,
		LayoutComponent
	],
	templateUrl: './organization-details.component.html',
	styleUrls: ['./organization-details.component.scss']
})
export class OrganizationDetailsComponent implements OnInit {

	@Input() classId: string = '';
	@Input() className: string = '';

	// Stats data
	totalUsers = 0;
	totalChiefs = 0;
	presenceRate = 0;

	// Presence balance data
	currentFilter: 'today' | 'week' | 'year' = 'today';
	filterOptions: FilterOption[] = [
		{value: 'today', label: 'Jour'},
		{value: 'week', label: 'Semaine'},
		{value: 'year', label: 'Mois'}
	];

	hourlyStats: any;
	dailyStats: any;
	monthlyStats: any;

	// Users data
	users: any[] = [];
	topPresenceUsers: UserPresenceRankingResponse[] = [];

	// Pagination
	currentPage = 1;
	itemsPerPage = 5;
	totalItems = 0;
	isLoading = true;

	constructor(
		private route: ActivatedRoute,
		private classService: ClassServiceService,
		private pointageService: PointageService
	) {}

	ngOnInit(): void {
		this.classId = this.route.snapshot.paramMap.get('id')!
		this.loadClassDetails();
		this.loadInitialData();
	}

	loadClassDetails(): void {
		this.classService.getClassServiceById(this.classId).subscribe({
			next: (classDetails) => {
				this.className = classDetails.nom;
			},
			error: (err) => console.error('Error loading class details:', err)
		});
	}

	loadInitialData(): void {
		this.isLoading = true;

		this.loadClassStats();
		this.loadPresenceData();
		this.loadUsersList();
		this.loadPresenceRanking();
	}

	loadClassStats(): void {
		// Nombre total d'utilisateurs
		this.classService.getTotalUsersCount(this.classId).subscribe(count => {
			this.totalUsers = count;
		});

		// TODO: Implémenter getTotalChiefsCount si nécessaire
		// this.classService.getTotalChiefsCount(this.classId).subscribe(count => {
		//   this.totalChiefs = count;
		// });

		// Statistiques de présence globales
		this.pointageService.getPresenceAbsenceCounts(this.classId, 'today').subscribe(stats => {
			this.presenceRate = stats.totalPresences > 0
				? Math.round((stats.totalPresences / (stats.totalPresences + stats.totalAbsences)) * 100)
				: 0;
		});
	}

	loadPresenceData(): void {
		// Données horaires (today)
		this.pointageService.getPresenceChartData(this.classId, 'today').subscribe(data => {
			this.hourlyStats = data;
		});

		// Données quotidiennes (week)
		this.pointageService.getPresenceChartData(this.classId, 'week').subscribe(data => {
			this.dailyStats = data;
		});

		// Données mensuelles (year)
		this.pointageService.getPresenceChartData(this.classId, 'year').subscribe(data => {
			this.monthlyStats = data;
		});
	}

	loadUsersList(): void {
		this.classService.getClassUsers(
			this.classId,
			this.currentPage - 1, // page index
			this.itemsPerPage
		).subscribe({
			next: (page) => {
				this.users = page.content;
				this.totalItems = page.totalElements;
			},
			error: (err) => console.error('Error loading users:', err)
		});
	}

	loadPresenceRanking(): void {
		const today = new Date();
		this.pointageService.getUsersPresenceRanking(this.classId, today)
			.pipe(
				finalize(() => this.isLoading = false)
			)
			.subscribe({
				next: (ranking) => {
					this.topPresenceUsers = ranking;
					this.topPresenceUsers = ranking.map(user => ({
						...user,
						status: this.getStatusFromPresenceRate(user.presencePercentage),
						timestamp: new Date().toLocaleString()
					}));
				},
				error: (err) => console.error('Error loading ranking:', err)
			});
	}

	onFilterChange(filter: 'today' | 'week' | 'year') {
		this.currentFilter = filter;
		this.loadPresenceData();
	}

	onPageChange(page: number): void {
		this.currentPage = page;
		this.loadUsersList();
	}

	private getStatusFromPresenceRate(rate: number): string {
		if (rate >= 90) return 'Complete';
		if (rate >= 70) return 'Pending';
		return 'Canceled';
	}

}
