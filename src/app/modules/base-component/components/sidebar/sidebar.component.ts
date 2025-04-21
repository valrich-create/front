import {Component, OnInit} from '@angular/core';
import {NavigationEnd, RouterLink, Router} from "@angular/router";
import {CommonModule} from "@angular/common";
// import {Router} from "express";
import {filter} from "rxjs";

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  active?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})

export class SidebarComponent implements OnInit {
  menuItems: MenuItem[] = [
    { icon: 'home', label: 'Dashboard', route: '/dashboard'},
    { icon: 'users', label: 'Users', route: '/users'},
    { icon: 'shield', label: 'Administrators', route: '/administrators'},
    { icon: 'calendar', label: 'Event', route: '/event'},
    { icon: 'wrench', label: 'Service', route: '/service'},
    { icon: 'building', label: 'Organizations', route: '/organizations'},
    { icon: 'user', label: 'Profile', route: '/profile'},
    { icon: 'message-circle', label: 'Chat', route: '/chat'},
    { icon: 'activity', label: 'Latest Activity', route: '/activity'}
  ];

  // constructor() { }
  constructor(private router: Router) { }

  ngOnInit(): void {
    this.updateActiveState();

    this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => {
          this.updateActiveState();
        });
  }

  private updateActiveState(): void {
    const currentRoute = this.router.url.split('?')[0];

    this.menuItems.forEach(item => {
      item.active = currentRoute === item.route || currentRoute.startsWith(item.route + '/');
    });
  }

  // private updateActiveState(currentUrl: string): void {
  //   this.menuItems.forEach(item => {
  //     // Active l'item si la route commence par le chemin du menu
  //     // (permet de gérer les sous-routes)
  //     item['active'] = currentUrl.startsWith(item.route);
  //
  //     // Pour une correspondance exacte uniquement, utilisez :
  //     // item['active'] = currentUrl === item.route;
  //   });
  // }
}
