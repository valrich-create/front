import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {NavbarComponent} from "../../../base-component/components/navbar/navbar.component";
import {AdminCardComponent} from "../../components/admin-card/admin-card.component";
import {LayoutComponent} from "../../../base-component/components/layout/layout.component";
import {NgbPaginationModule} from "@ng-bootstrap/ng-bootstrap";
import {Router, RouterModule} from "@angular/router";
import {AdministratorServiceService} from "../../services/administrator-service.service";
import {SearchBarComponent} from "../../../base-component/components/search-bar/search-bar.component";
import {SortOption} from "../../../users/users.models";

@Component({
    selector: 'app-admin-list',
    standalone: true,
    imports: [
        CommonModule,
        NavbarComponent,
        AdminCardComponent,
        LayoutComponent,
        NgbPaginationModule,
        SearchBarComponent
    ],
    templateUrl: "./admin-list.component.html",
    styleUrls: ["./admin-list.component.scss"]
})

export class AdminListComponent implements OnInit {
    admins: any[] = [];
    totalAdmins = 100;
    currentPage = 1;
    pageSize = 15;

    currentSort: SortOption = 'createdAt';
    currentSearchTerm: string = '';

    constructor(private administratorServiceService: AdministratorServiceService, private router: Router) {}

    ngOnInit(): void {
        this.loadAdmins();
    }

    loadAdmins(): void {
        this.administratorServiceService
            .getAllAdministratorsOrAdvancedUsers(this.currentPage, this.pageSize, this.currentSort, this.currentSearchTerm)
            .subscribe({
                next: (admins) => {
                    this.admins = admins;
                    this.totalAdmins = admins.length;
                },
                error: (err) => console.error('Erreur chargement', err)
            });
    }

    handleAction(event: {type: string, admin: any}): void {
        switch(event.type) {
            case 'edit':
                console.log('Edit admins', event.admin);
                this.router.navigate(['administrators', 'edit', event.admin.id]);
                break;
            case 'delete':
                if(confirm('Are you sure you want to delete this admins?')) {
                    this.administratorServiceService.deleteAdministrator(event.admin.id).subscribe({
                        next: () => this.loadAdmins(),
                        error: err => console.error('An error occurred when deleting Super admin', err)
                    });
                }
                break;
            case 'details':
                console.log('View details', event.admin);
                this.router.navigate(['administrators', event.admin.id]);
                break;
        }
    }

    onSortChange(sortOption: SortOption): void {
        this.currentSort = sortOption;
        this.loadAdmins();
    }

    onSearchChange(searchTerm: string): void {
        this.currentSearchTerm = searchTerm;
        this.loadAdmins();
    }

    protected readonly Math = Math;
}
