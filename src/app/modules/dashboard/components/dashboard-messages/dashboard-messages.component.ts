import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from "@angular/common";
import {EventService} from "../../../events/events.service";
import {InformationResponse} from "../../../events/information";
import {RouterLink} from "@angular/router";

@Component({
	selector: 'app-dashboard-messages',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './dashboard-messages.component.html',
	styleUrls: ['./dashboard-messages.component.scss']
})
export class DashboardMessagesComponent implements OnInit {
	@Input() establishmentId?: string;
	informations: InformationResponse[] = [];
	colors: string[] = [];

	constructor(private eventService: EventService) { }

	ngOnInit(): void {
		this.loadLatestInformations();
	}

	loadLatestInformations(): void {
		this.eventService.getLatestInformations(5).subscribe({
			next: (infos) => {
				this.informations = infos;
				this.colors = infos.map(() => this.getRandomColor());
			},
			error: (err) => {
				console.error('Failed to load latest informations:', err);
			}
		});
	}

	truncateContent(content: string, maxLength: number = 50): string {
		return content.length > maxLength ?
			content.substring(0, maxLength) + '...' :
			content;
	}

	formatDate(date: Date | string): string {
		const d = new Date(date);
		return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	getColor(index: number): string {
		return this.colors[index] || '#FFFFFF'; // Couleur par défaut si hors limite
	}

	private getRandomColor(): string {
		const colors = [
			'#FF6347', '#4169E1', '#32CD32', '#FFD700',
			'#9370DB', '#20B2AA', '#FF69B4', '#FF4500'
		];
		return colors[Math.floor(Math.random() * colors.length)];
	}
	//
	// getRandomColor(): string {
	// 	const colors = [
	// 		'#FF6347', '#4169E1', '#32CD32', '#FFD700',
	// 		'#9370DB', '#20B2AA', '#FF69B4', '#FF4500'
	// 	];
	// 	return colors[Math.floor(Math.random() * colors.length)];
	// }
}