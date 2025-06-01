import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Establishment} from "../../organization";

@Component({
	selector: 'app-percentage-circle',
	standalone: true,
	imports: [CommonModule],
	templateUrl: "percentage-circle.component.html",
	styleUrls: ["percentage-circle.component.scss"]
})

export class PercentageCircleComponent implements OnChanges {
	@Input() establishment?: Establishment;
	@Input() current?: number;
	@Input() max?: number;

	circumference = 2 * Math.PI * 16;
	dashOffset = 0;
	calculatedPercentage = 0;

	ngOnChanges(): void {
		this.calculatePercentage();
	}

	// calculatePercentage(): void {
	// 	if (!this.establishment || !this.establishment.nombreMaxUtilisateurs) {
	// 		this.calculatedPercentage = 0;
	// 		this.dashOffset = this.circumference;
	// 		return;
	// 	}
	//
	// 	const current = this.establishment.nombreUtilisateursActuels || 0;
	// 	const max = this.establishment.nombreMaxUtilisateurs;
	//
	// 	this.calculatedPercentage = Math.round((current / max) * 100);
	// 	this.calculatedPercentage = Math.min(this.calculatedPercentage, 100);
	// 	this.dashOffset = this.circumference - (this.calculatedPercentage / 100) * this.circumference;
	// }

	calculatePercentage(): void {
		let currentValue: number;
		let maxValue: number;

		if (this.establishment) {
			currentValue = this.establishment.nombreUtilisateursActuels || 0;
			maxValue = this.establishment.nombreMaxUtilisateurs || 1;
		} else {
			currentValue = this.current || 0;
			maxValue = this.max || 1;
		}

		this.calculatedPercentage = Math.round((currentValue / maxValue) * 100);
		this.calculatedPercentage = Math.min(this.calculatedPercentage, 100);
		this.dashOffset = this.circumference - (this.calculatedPercentage / 100) * this.circumference;
	}

	getCircleColor(): string {
		if (this.calculatedPercentage >= 90) return '#dc2626';
		if (this.calculatedPercentage >= 70) return '#ea580c';
		return '#4338ca';
	}
}