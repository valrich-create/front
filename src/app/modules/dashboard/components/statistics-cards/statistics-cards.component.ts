import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-statistics-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics-cards.component.html',
  styleUrls: ['./statistics-cards.component.scss']
})
export class StatisticsCardsComponent implements OnInit {
  statistics = [
    { title: 'Users', count: 932, icon: 'users', color: '#5e4dcd' },
    { title: 'Admins', count: 754, icon: 'shield', color: '#ff7a59' },
    { title: 'Events', count: 40, icon: 'calendar', color: '#ffb84d' },
    { title: 'Organizations', count: '32k', icon: 'building', color: '#475569' }
  ];

  constructor() { }

  ngOnInit(): void { }
}
