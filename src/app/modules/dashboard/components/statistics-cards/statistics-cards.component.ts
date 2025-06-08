import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from "@angular/common";
import { GlobalStatsResponse } from "../../../organizations/organization";

@Component({
	selector: 'app-statistics-cards',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './statistics-cards.component.html',
	styleUrls: ['./statistics-cards.component.scss']
})
export class StatisticsCardsComponent {
	@Input() currentUsersCount: number = 0;
	@Input() adminsCount: number = 0;
	@Input() classesCount: number = 0;
	@Input() globalPresencePercentage: number = 0;
	@Input() isSuperAdmin: boolean = false;
	@Input() globalStats?: GlobalStatsResponse;

	statistics: any[] = [];

	ngOnInit() {
		this.updateStatistics();
	}

	ngOnChanges() {
		this.updateStatistics();
	}

	private updateStatistics() {
		if (this.isSuperAdmin && this.globalStats) {
			this.statistics = [
				{
					title: 'Total Users',
					count: this.globalStats.totalUsers,
					icon: 'users',
					color: '#5e4dcd'
				},
				{
					title: 'Max Capacity',
					count: this.globalStats.maxCapacity,
					icon: 'database',
					color: '#ff7a59'
				},
				{
					title: 'Total Establishments',
					count: this.globalStats.totalEstablishments,
					icon: 'home',
					color: '#ffb84d'
				},
				{
					title: 'Average Presence',
					count: 'N/A', // Ou une valeur calculée si disponible
					icon: 'activity',
					color: '#475569'
				}
			];
		} else {
			this.statistics = [
				{
					title: 'Current Users',
					count: this.currentUsersCount,
					icon: 'users',
					color: '#5e4dcd'
				},
				{
					title: 'Admins',
					count: this.adminsCount,
					icon: 'shield',
					color: '#ff7a59'
				},
				{
					title: 'Classes',
					count: this.classesCount,
					icon: 'layers',
					color: '#ffb84d'
				},
				{
					title: 'Global Presence',
					count: `${this.globalPresencePercentage}%`,
					icon: 'activity',
					color: '#475569'
				}
			];
		}
	}
}