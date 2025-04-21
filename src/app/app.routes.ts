import { Routes } from '@angular/router';
import {DashboardComponent} from "./modules/dashboard/dashboard/dashboard.component";
import {UserListComponent} from "./modules/users/pages/user-list/user-list.component";
import {UserFormComponent} from "./modules/users/pages/user-form/user-form.component";
import {UserDetailsComponent} from "./modules/users/pages/user-details/user-details.component";

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
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
    // {
    //     path: 'users',
    //     component: UserListComponent,
    // },
    // {
    //     path: 'users/new',
    //     component: UserFormComponent
    // },
    // {
    //     path: 'users/:id',
    //     component: UserDetailsComponent
    // },
    // {
    //     path: 'users/edit/:id',
    //     component: UserFormComponent
    // },
    {
        path: '**',
        redirectTo: 'dashboard'
    }
];
