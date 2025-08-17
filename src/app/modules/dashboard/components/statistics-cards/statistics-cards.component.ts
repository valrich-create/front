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
					title: 'Total Utilisateurs',
					count: this.globalStats.totalUsers,
					icon: 'users',
					color: '#5e4dcd'
				},
				{
					title: 'Capacite Maximale',
					count: this.globalStats.maxCapacity,
					icon: 'database',
					color: '#ff7a59'
				},
				{
					title: 'Total Organisations',
					count: this.globalStats.totalEstablishments,
					icon: 'home',
					color: '#ffb84d'
				},
				{
					title: 'Moyenne de Presence',
					count: 'N/A', // Ou une valeur calculée si disponible
					icon: 'activity',
					color: '#475569'
				}
			];
		} else {
			this.statistics = [
				{
					title: 'Utilisateurs actuel',
					count: this.currentUsersCount,
					icon: 'users',
					color: '#5e4dcd'
				},
				{
					title: 'Administrateurs',
					count: this.adminsCount,
					icon: 'shield',
					color: '#ff7a59'
				},
				{
					title: 'Classes/Services',
					count: this.classesCount,
					icon: 'layers',
					color: '#ffb84d'
				},
				{
					title: 'Presence Globale',
					count: `${this.globalPresencePercentage}%`,
					icon: 'activity',
					color: '#475569'
				}
			];
		}
	}

	getMaterialIcon(featherIcon: string): string {
		const iconMap: { [key: string]: string } = {
			'users': 'people',
			'shield': 'admin_panel_settings',
			'layers': 'layers',
			'activity': 'analytics',
			'database': 'storage',
			'home': 'home'
		};
		return iconMap[featherIcon] || 'help';
	}

	getCardClass(color: string): string {
		switch (color) {
			case '#5e4dcd': return 'card-purple';
			case '#ff7a59': return 'card-orange';
			case '#ffb84d': return 'card-yellow';
			case '#475569': return 'card-gray';
			default: return 'card-gray';
		}
	}

	isHighValue(count: any): boolean {
		const numericCount = typeof count === 'string' ?
			parseInt(count.replace(/[^\d]/g, '')) : count;
		return numericCount > 100;
	}

}