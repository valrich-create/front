import {Component, Input} from '@angular/core';
import {CommonModule} from "@angular/common";
import {ClassStatsCardsComponent} from "../../components/class-stats-cards/class-stats-cards.component";
import {ClassUsersListComponent} from "../../components/class-users-list/class-users-list.component";
import {
    ClassPresenceClassementComponent
} from "../../components/class-presence-classement/class-presence-classement.component";
import {ClassPresenceBalanceComponent} from "../../components/class-presence-balance/class-presence-balance.component";
import {NavbarComponent} from "../../../base-component/components/navbar/navbar.component";
import {LayoutComponent} from "../../../base-component/components/layout/layout.component";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";

@Component({
    selector: 'app-organization-details',
    standalone: true,
    imports: [
        CommonModule,
        ClassStatsCardsComponent,
        ClassPresenceClassementComponent,
        ClassUsersListComponent,
        ClassPresenceBalanceComponent,
        FontAwesomeModule,
        NavbarComponent,
        LayoutComponent
    ],
    templateUrl: './organization-details.component.html',
    styleUrls: ['./organization-details.component.scss']
})
export class OrganizationDetailsComponent {
    @Input() className: string = 'Classe A';

    // Stats data
    totalUsers = 932;
    totalChiefs = 754;
    presenceRate = 86;

    // Presence balance data
    presencesCount = 1245;
    absencesCount = 1356;

    // Users data
    users = [
        { name: 'Samantha W.', id: '123456789', class: 'VII A', presenceRate: 85, status: 'Complete', timestamp: '2 March 2021, 13:45 PM' },
        { name: 'Tony Soap', id: '123456789', class: 'VII A', presenceRate: 70, status: 'Pending', timestamp: '2 March 2021, 13:45 PM' },
        { name: 'Jordan Nico', id: '123456789', class: 'VII A', presenceRate: 45, status: 'Canceled', timestamp: '2 March 2021, 13:45 PM' },
        { name: 'Karen Hope', id: '123456789', class: 'VII A', presenceRate: 92, status: 'Complete', timestamp: '2 March 2021, 13:45 PM' },
        { name: 'Nadila Adja', id: '123456789', class: 'VII A', presenceRate: 88, status: 'Complete', timestamp: '2 March 2021, 13:45 PM' }
    ];

    // Top presence users
    topPresenceUsers = [
        { id: '123456789', presenceRate: 95, absenceRate: 5, status: 'Complete', timestamp: '2 March 2021, 13:45 PM' },
        { id: '123456789', presenceRate: 80, absenceRate: 20, status: 'Pending', timestamp: '2 March 2021, 13:45 PM' },
        { id: '123456789', presenceRate: 65, absenceRate: 35, status: 'Canceled', timestamp: '2 March 2021, 13:45 PM' },
        { id: '123456789', presenceRate: 92, absenceRate: 8, status: 'Complete', timestamp: '2 March 2021, 13:45 PM' },
        { id: '123456789', presenceRate: 88, absenceRate: 12, status: 'Complete', timestamp: '2 March 2021, 13:45 PM' }
    ];

    // Pagination
    currentPage = 1;
    itemsPerPage = 5;
    totalItems = 100;
}
