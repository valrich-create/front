import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from "@angular/common";

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

	statistics = [
		{
			title: 'Utilisateurs présents',
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
			title: 'Classes',
			count: this.classesCount,
			icon: 'layers',
			color: '#ffb84d'
		},
		{
			title: 'Présence globale',
			count: `${this.globalPresencePercentage}%`,
			icon: 'activity',
			color: '#475569'
		}
	];

	ngOnChanges() {
		this.updateStatistics();
	}

	private updateStatistics() {
		this.statistics = [
			{
				title: 'Utilisateurs présents',
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
				title: 'Classes',
				count: this.classesCount,
				icon: 'layers',
				color: '#ffb84d'
			},
			{
				title: 'Présence globale',
				count: `${this.globalPresencePercentage}%`,
				icon: 'activity',
				color: '#475569'
			}
		];
	}
}








// import {Component, OnInit} from '@angular/core';
// import {CommonModule} from "@angular/common";
//
// @Component({
//   selector: 'app-statistics-cards',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './statistics-cards.component.html',
//   styleUrls: ['./statistics-cards.component.scss']
// })
// export class StatisticsCardsComponent implements OnInit {
//   statistics = [
//     { title: 'Users', count: 932, icon: 'users', color: '#5e4dcd' },
//     { title: 'Admins', count: 754, icon: 'shield', color: '#ff7a59' },
//     { title: 'Events', count: 40, icon: 'calendar', color: '#ffb84d' },
//     { title: 'Organizations', count: '32k', icon: 'building', color: '#475569' }
//   ];
//
//   constructor() { }
//
//   ngOnInit(): void { }
// }
