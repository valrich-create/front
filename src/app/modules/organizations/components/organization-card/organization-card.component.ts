// organization-card.component.ts
import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BarChartComponent} from "../bar-chart/bar-chart.component";
import { UsersCountIndicatorComponent} from "../growth-indicator/growth-indicator.component";
import {PercentageCircleComponent} from "../percentage-circle/percentage-circle.component";
import {Establishment} from "../../organization";

@Component({
  selector: 'app-organization-card',
  standalone: true,
  imports: [
    CommonModule,
    PercentageCircleComponent,
    UsersCountIndicatorComponent
  ],
  templateUrl: './organization-card.component.html',
  styleUrls: ['./organization-card.component.scss']
})

export class OrganizationCardComponent implements OnChanges {
  @Input() establishment!: Establishment;
  @Input() timePeriod: string = 'Today';

  @Output() viewDetails = new EventEmitter<Establishment>();
  @Output() editEstablishment = new EventEmitter<string>();
  @Output() deleteEstablishment = new EventEmitter<string>();

  showActions = false;

  ngOnChanges(): void {
    // Met à jour les données lors du changement de période
    this.updateData();
  }

  updateData(): void {
    // Cette méthode serait appelée quand timePeriod change
    // Elle pourrait mettre à jour les données locales ou déclencher un appel API
  }

  toggleActions(event: MouseEvent): void {
    event.stopPropagation(); // Empêche la navigation vers la event-form détail
    this.showActions = !this.showActions;
  }

  onEdit(event: MouseEvent): void {
    event.stopPropagation();
    this.editEstablishment.emit(this.establishment.id);
    this.showActions = false;
  }

  onViewDetail(event: MouseEvent): void {
    event.stopPropagation();
    this.viewDetails.emit(this.establishment);
    this.showActions = false;
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.deleteEstablishment.emit(this.establishment.id);
    this.showActions = false;
  }
}