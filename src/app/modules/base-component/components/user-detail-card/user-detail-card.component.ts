import {Component, Input} from '@angular/core';
import {UserResponse} from "../../../users/users.models";
import {Admin} from "../../../administrators/admin";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {NavbarComponent} from "../navbar/navbar.component";
import {LayoutComponent} from "../layout/layout.component";

@Component({
	selector: 'app-user-detail-card',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		NavbarComponent,
		LayoutComponent
	],
	templateUrl: 'user-detail-card.component.html',
	styleUrls: ['user-detail-card.component.scss']
})

export class UserDetailCardComponent {
	@Input() user!: UserResponse | Admin;
	@Input() isAdmin: boolean = false;
	@Input() pageTitle: string = 'User Details';

	@Input() onEdit!: (user: UserResponse | Admin) => void;
	@Input() onDelete!: (user: UserResponse |  Admin) => void;
	@Input() onAssignToClass?: (user: UserResponse | Admin) => void; // facultatif
}
