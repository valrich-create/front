import {Component, OnInit} from '@angular/core';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  imports: [
    RouterLink
  ],
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  menuItems = [
    { icon: 'home', label: 'Dashboard', route: '/dashboard', active: true },
    { icon: 'users', label: 'Users', route: '/users', active: false },
    { icon: 'shield', label: 'Administrators', route: '/administrators', active: false },
    { icon: 'calendar', label: 'Event', route: '/event', active: false },
    { icon: 'wrench', label: 'Service', route: '/service', active: false },
    { icon: 'building', label: 'Organizations', route: '/organizations', active: false },
    { icon: 'user', label: 'Profile', route: '/profile', active: false },
    { icon: 'message-circle', label: 'Chat', route: '/chat', active: false },
    { icon: 'activity', label: 'Latest Activity', route: '/activity', active: false }
  ];

  constructor() { }

  ngOnInit(): void { }
}
