import { Routes } from '@angular/router';
import {DashboardComponent} from "./modules/dashboard/dashboard/dashboard.component";
import {UserListComponent} from "./modules/users/pages/user-list/user-list.component";
import {UserFormComponent} from "./modules/users/pages/user-form/user-form.component";
import {UserDetailsComponent} from "./modules/users/pages/user-details/user-details.component";
import {SuperAdminListComponent} from "./modules/administrators/pages/super-admin-list/super-admin-list.component";
import {AdminFormComponent} from "./modules/administrators/pages/admin-form/admin-form.component";
import {
    OrganizationsListComponent
} from "./modules/organizations/pages/organizations-list/organizations-list.component";
import {OrganizationFormComponent} from "./modules/organizations/pages/organization-form/organization-form.component";
import {
    OrganizationDetailsComponent
} from "./modules/organizations/pages/organization-details/organization-details.component";
import {EventsPageComponent} from "./modules/events/events-page/events-page.component";
import {EventFormComponent} from "./modules/events/event-form/event-form.component";
import {OrgAdminDetailsComponent} from "./modules/administrators/pages/admin-details/org-admin-details.component";
import {ClassServiceListComponent} from "./modules/services/class-service-list/class-service-list.component";
import {ClassServiceFormComponent} from "./modules/services/class-service-form/class-service-form.component";
import {PointingHourFormComponent} from "./modules/pointing-hour/page/pointing-hour-form/pointing-hour-form.component";
import {PointingZoneFormComponent} from "./modules/pointing-zone/page/pointing-zone-form/pointing-zone-form.component";
import {PointingZoneListComponent} from "./modules/pointing-zone/page/pointing-zone-list/pointing-zone-list.component";
import {OrgAdminListComponent} from "./modules/super-admin/pages/admin-list/org-admin-list.component";
import {SuperAdminFormComponent} from "./modules/super-admin/pages/super-admin-form/super-admin-form.component";
import {ChatComponent} from "./modules/chat/chat/chat.component";
import {ProfileComponent} from "./modules/profile/profile/profile.component";
import {PointingHourListComponent} from "./modules/pointing-hour/page/pointing-hour-list/pointing-hour-list.component";
import {
    AdvanceUsersListComponent
} from "./modules/super-admin/pages/all-advance-users-list/advance-users-list.component";

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
        children: [
            // { path: 'sub-route', component: SubComponent }
        ]
    },
    {
        path: 'chat',
        component: ChatComponent,
    },
    {
        path: 'profile',
        component: ProfileComponent,
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
            { path: '', component: AdvanceUsersListComponent },
            { path: 'new', component: AdminFormComponent },
            { path: ':id', component: OrgAdminDetailsComponent },
            { path: 'edit/:id', component: AdminFormComponent }
        ]
    },
    {
        path: 'organization-admin',
        children: [
            { path: '', component: OrgAdminListComponent },
            { path: 'new', component: UserFormComponent },
            { path: ':id', component: OrgAdminDetailsComponent },
            { path: 'edit/:id', component: UserFormComponent }
        ]
    },
    {
        path: 'super-admin',
        children: [
            { path: '', component: SuperAdminListComponent },
            { path: 'new', component: SuperAdminFormComponent },
            { path: ':id', component: OrgAdminDetailsComponent },
            { path: 'edit/:id', component: SuperAdminFormComponent }
        ]
    },
    {
        path: 'organizations',
        children: [
            { path: '', component: OrganizationsListComponent },
            { path: 'new', component: OrganizationFormComponent },
            { path: ':id', component: DashboardComponent },
            { path: 'edit/:id', component: OrganizationFormComponent }
        ]
    },
    {
        path: 'class-services',
        children: [
            { path: '', component: ClassServiceListComponent },
            { path: 'new', component: ClassServiceFormComponent },
            { path: ':id', component: OrganizationDetailsComponent },
            { path: 'edit/:id', component: ClassServiceFormComponent }
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
        path: 'schedule',
        children: [
            { path: '', component: PointingHourListComponent },
            { path: 'new', component: PointingHourFormComponent },
            { path: 'edit/:id', component: PointingHourFormComponent },
        ]
    },
    {
        path: 'zone',
        children: [
            { path: '', component: PointingZoneListComponent },
            { path: 'new', component: PointingZoneFormComponent },
            { path: 'edit/:id', component: PointingZoneFormComponent },
        ]
    },
    {
        path: 'classes/:classId/pointing-hours',
        children: [
            { path: '', component: PointingHourListComponent },
            { path: 'new', component: PointingHourFormComponent },
            { path: 'edit/:id', component: PointingHourFormComponent },
        ]
    },
    {
        path: 'classes/:classId/pointing-zones',
        children: [
            { path: '', component: PointingZoneListComponent },
            { path: 'new', component: PointingZoneFormComponent },
            { path: 'edit/:id', component: PointingZoneFormComponent },
        ]
    },
    {
        path: '**',
        redirectTo: 'dashboard'
    }
];
