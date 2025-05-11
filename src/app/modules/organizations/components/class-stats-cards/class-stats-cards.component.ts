import {Component, Input} from '@angular/core';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";

@Component({
  selector: 'app-class-stats-cards',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './class-stats-cards.component.html',
  styleUrls: ['./class-stats-cards.component.scss']
})
export class ClassStatsCardsComponent {
  @Input() totalUsers: number = 0;
  @Input() totalChiefs: number = 0;
  @Input() presenceRate: number = 0;

  openPointingZone() {
    // Cette fonction sera implémentée plus tard pour ouvrir le modal Pointing Zone
    console.log('Opening Pointing Zone modal');
  }

  openEditService() {
    // Cette fonction sera implémentée plus tard pour ouvrir le modal Edit Service
    console.log('Opening Edit Service modal');
  }
}
