import { Routes } from '@angular/router';
import {DashboardComponent} from "./modules/dashboard/dashboard/dashboard.component";
import {UserListComponent} from "./modules/users/pages/user-list/user-list.component";
import {UserFormComponent} from "./modules/users/pages/user-form/user-form.component";
import {UserDetailsComponent} from "./modules/users/pages/user-details/user-details.component";
import {AdminListComponent} from "./modules/administrators/pages/admin-list/admin-list.component";
import {AdminFormComponent} from "./modules/administrators/pages/admin-form/admin-form.component";
import {
    OrganizationsListComponent
} from "./modules/organizations/pages/organizations-list/organizations-list.component";
import {OrganizationFormComponent} from "./modules/organizations/pages/organization-form/organization-form.component";
import {
    OrganizationDetailsComponent
} from "./modules/organizations/pages/organization-details/organization-details.component";
import {EventsListComponent} from "./modules/events/event-list/events-list.component";
import {EventsPageComponent} from "./modules/events/events-page/events-page.component";
import {ClassComponent} from "./modules/organizations/components/class/class.component";
import {EventFormComponent} from "./modules/events/event-form/event-form.component";
import {AdminDetailsComponent} from "./modules/administrators/pages/admin-details/admin-details.component";

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./modules/auth/component/login/login.component').then(m => m.LoginComponent),
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        // Si vous avez des composants enfants :
        children: [
            // { path: 'sub-route', component: SubComponent }
        ]
    },
    {
        path: 'users',
        children: [
            { path: '', component: UserListComponent }, // /users
            { path: 'new', component: UserFormComponent }, // /users/new
            { path: ':id', component: UserDetailsComponent }, // /users/123
            { path: 'edit/:id', component: UserFormComponent } // /users/edit/123
        ]
    },
    {
        path: 'administrators',
        children: [
            { path: '', component: AdminListComponent }, // administrators
            { path: 'new', component: AdminFormComponent }, // /administrators/new
            { path: ':id', component: AdminDetailsComponent }, // /administrators/123
            { path: 'edit/:id', component: AdminFormComponent } // /administrators/edit/123
        ]
    },
    {
        path: 'organizations',
        children: [
            { path: '', component: OrganizationsListComponent }, // organizations
            { path: 'new', component: OrganizationFormComponent }, // /organizations/new
            { path: ':id', component: OrganizationDetailsComponent }, // /organizations/123
            { path: 'edit/:id', component: OrganizationFormComponent } // /organizations/edit/123
        ]
    },
    {
        path: 'events',
        children: [
            { path: '', component: EventsPageComponent }, // events
            { path: 'new', component: EventFormComponent }, // /events/new
            { path: 'edit/:id', component: EventFormComponent } // /events/edit/123
        ]
    },
    {
        path: '**',
        redirectTo: 'dashboard'
    }
];
