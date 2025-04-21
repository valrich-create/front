import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";

interface ActivityItem {
  id: string;
  user: string;
  class: string;
  amount: string;
  avatar: string;
}

@Component({
  selector: 'app-recent-administration-activity',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recent-administration-activity.component.html',
  styleUrls: ['./recent-administration-activity.component.scss']
})
export class RecentAdministrationActivityComponent implements OnInit {
  activities: ActivityItem[] = [
    { id: '123456789', user: 'Samantha William', class: 'VII A', amount: '$50,036', avatar: 'assets/avatars/avatar1.jpg' },
    { id: '123456789', user: 'Tony Soap', class: 'VII A', amount: '$50,036', avatar: 'assets/avatars/avatar2.jpg' },
    { id: '123456789', user: 'Jordan Nico', class: 'VII A', amount: '$50,036', avatar: 'assets/avatars/avatar3.jpg' },
    { id: '123456789', user: 'Karen Hope', class: 'VII A', amount: '$50,036', avatar: 'assets/avatars/avatar4.jpg' },
    { id: '123456789', user: 'Nadia Adja', class: 'VII A', amount: '$50,036', avatar: 'assets/avatars/avatar5.jpg' }
  ];

  pagination = {
    currentPage: 1,
    totalPages: 3,
    showingFrom: 1,
    showingTo: 5,
    total: 100
  };

  constructor() { }

  ngOnInit(): void { }
}
