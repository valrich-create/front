import {Component, OnInit} from '@angular/core';
import {NavigationEnd, RouterLink, Router} from "@angular/router";
import {CommonModule} from "@angular/common";
// import {Router} from "express";
import {filter} from "rxjs";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {AuthService} from "../../../auth/service/auth.service";

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
        CommonModule,
        FontAwesomeModule
    ],
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})

export class SidebarComponent implements OnInit {
    role: string | null = null;

    menuItems: MenuItem[] = [];

    private buildMenuItemsForRole(role: string | null): MenuItem[] {
        const commonItems: MenuItem[] = [
            {icon: 'bi-house', label: 'Dashboard', route: '/dashboard'},
            {icon: 'bi-shield', label: 'Super Admins', route: '/super-admin'},
            {icon: 'bi-shield', label: 'Administrators', route: '/administrators'},
            {icon: 'bi-shield', label: 'Org Admins', route: '/organization-admin'},
            {icon: 'bi-building', label: 'Organizations', route: '/organizations'},
            {icon: 'bi-collection', label: 'Classes/Services', route: '/class-services'},
            {icon: 'bi-people', label: 'Users', route: '/users'},
            {icon: 'bi-calendar', label: 'Event', route: '/events'},
            {icon: 'bi-chat', label: 'Chat', route: '/chat'},
            {icon: 'bi-person', label: 'Profile', route: '/profile'},
        ];

        const adminItems: MenuItem[] = [
            {icon: 'bi-house', label: 'Dashboard', route: '/dashboard'},
            {icon: 'bi-shield', label: 'Administrators', route: '/administrators'},
            {icon: 'bi-people', label: 'Users', route: '/users'},
            {icon: 'bi-chat', label: 'Chat', route: '/chat'},
            {icon: 'bi-person', label: 'Profile', route: '/profile'},
            {icon: 'bi-collection', label: 'Classes/Services', route: '/class-services'},
            {icon: 'bi-calendar', label: 'Event', route: '/events'}
        ];

        switch (role) {
            case 'SUPER_ADMIN':
                return [...commonItems];
            // case 'ADMIN':
            //     return [...commonItems]; // e.g. Users + Events
            // case 'USER':
            //     return commonItems;
            default:
                return adminItems;
        }
    }

    // constructor() { }
    constructor(
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.role = this.authService.getUserRole();
        this.menuItems = this.buildMenuItemsForRole(this.role);

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
}
