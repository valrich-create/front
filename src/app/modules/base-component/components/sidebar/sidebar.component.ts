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
            {icon: 'home', label: 'Dashboard', route: '/dashboard'},
            {icon: 'shield', label: 'Administrators', route: '/administrators'},
            {icon: 'users', label: 'Users', route: '/users'},
            {icon: 'calendar', label: 'Event', route: '/events'},
            {icon: 'message-circle', label: 'Chat', route: '/chat'},
            {icon: 'user', label: 'Profile', route: '/profile'},
            {icon: 'building', label: 'Organizations', route: '/organizations'},
            {icon: 'activity', label: 'Latest Activity', route: '/activity'}
        ];

        const adminItems: MenuItem[] = [
            {icon: 'home', label: 'Dashboard', route: '/dashboard'},
            {icon: 'shield', label: 'Administrators', route: '/administrators'},
            {icon: 'users', label: 'Users', route: '/users'},
            {icon: 'building', label: 'Organizations', route: '/organizations'},
            {icon: 'user', label: 'Profile', route: '/profile'},
            {icon: 'activity', label: 'Latest Activity', route: '/activity'}
        ];

        switch (role) {
            case 'SUPER_ADMIN':
                return [...adminItems];
            // case 'ADMIN':
            //     return [...commonItems]; // e.g. Users + Events
            // case 'USER':
            //     return commonItems;
            default:
                return commonItems;
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
