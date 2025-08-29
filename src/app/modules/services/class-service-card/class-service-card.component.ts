import {Component, Input, OnChanges} from '@angular/core';
import {ClassServiceResponse} from "../class-service";
import {UsersCountIndicatorComponent} from "../../organizations/components/growth-indicator/growth-indicator.component";
import {PercentageCircleComponent} from "../../organizations/components/percentage-circle/percentage-circle.component";
import {CommonModule} from "@angular/common";
import {Router} from "@angular/router";

@Component({
	selector: 'app-class-service-card',
	standalone: true,
	imports: [
		UsersCountIndicatorComponent,
		PercentageCircleComponent,
		CommonModule
	],
	templateUrl: 'class-service-card.component.html',
	styleUrls: ['class-service-card.component.scss']
})

export class ClassServiceCardComponent implements OnChanges{
	@Input() classService!: ClassServiceResponse;
	@Input() timePeriod: string = 'Today';

	showActions = false;
	classId: string = '';

	constructor(
		private router: Router
	) {
	}

	ngOnChanges(): void {
		this.updateData();
	}

	updateData(): void {
		// Logique de mise à jour si nécessaire
	}

	toggleActions(event: MouseEvent): void {
		event.stopPropagation();
		this.showActions = !this.showActions;
	}

	onEdit(event: MouseEvent): void {
		event.stopPropagation();
		this.router.navigate(['/class-services/edit', this.classId]);
	}

	onViewDetail(event: MouseEvent): void {
		event.stopPropagation();
		// Logique pour voir les détails de la classe/service
	}
}
