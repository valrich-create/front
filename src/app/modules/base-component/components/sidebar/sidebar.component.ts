import {Component, OnInit} from '@angular/core';
import {NavigationEnd, RouterLink, Router} from "@angular/router";
import {CommonModule} from "@angular/common";
import {filter} from "rxjs";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {AuthService} from "../../../auth/service/auth.service";

interface MenuItem {
    icon: string;
    label: string;
    route: string;
    active?: boolean;
}

interface MenuSection {
    title: string;
    items: MenuItem[];
    visible: boolean;
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
    menuSections: MenuSection[] = [];
    sidebarOpen = false;
    sidebarCollapsed = false;

    private buildMenuSectionsForRole(role: string | null): MenuSection[] {
        const administrationItems: MenuItem[] = [
            {icon: 'bi-shield', label: 'Super Admins', route: '/super-admin'},
            {icon: 'bi-building', label: 'Organisations', route: '/organizations'},
            {icon: 'bi-shield', label: 'Admins d\'organisation', route: '/administrators'},
        ];

        const etablissementItems: MenuItem[] = [
            {icon: 'bi-house', label: 'Tableau de bord', route: '/dashboard'},
            {icon: 'bi-shield', label: 'Administrateurs', route: '/organization-admin'},
            {icon: 'bi-collection', label: 'Classes / Services', route: '/class-services'},
            {icon: 'bi-people', label: 'Utilisateurs', route: '/users'},
            {icon: 'bi-calendar', label: 'Événements', route: '/events'},
            {icon: 'bi-clock', label: 'Horaires', route: '/schedule'},
            {icon: 'bi-geo', label: 'Zones', route: '/zone'}
        ];

        const compteItems: MenuItem[] = [
            {icon: 'bi-chat', label: 'Messagerie', route: '/chat'},
            {icon: 'bi-person', label: 'Profil', route: '/profile'}
        ];

        const sections: MenuSection[] = [
            {
                title: 'GESTION ADMINISTRATIVE',
                items: administrationItems,
                visible: role === 'SUPER_ADMIN'
            },
            {
                title: 'MON ÉTABLISSEMENT',
                items: etablissementItems,
                visible: true
            },
            {
                title: 'MON COMPTE',
                items: compteItems,
                visible: true
            }
        ];

        return sections;
    }

    constructor(
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.role = this.authService.getUserRole();
        this.menuSections = this.buildMenuSectionsForRole(this.role);

        this.updateActiveState();

        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(() => {
                this.updateActiveState();
            });
    }

    toggleSidebar(): void {
        this.sidebarCollapsed = !this.sidebarCollapsed;
    }

    private updateActiveState(): void {
        const currentRoute = this.router.url.split('?')[0];

        this.menuSections.forEach(section => {
            section.items.forEach(item => {
                item.active = currentRoute === item.route || currentRoute.startsWith(item.route + '/');
            });
        });
    }
}