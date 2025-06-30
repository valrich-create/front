import {Component, Inject} from '@angular/core';
import {
	MAT_DIALOG_DATA,
	MatDialogActions,
	MatDialogContent,
	MatDialogRef,
	MatDialogTitle
} from '@angular/material/dialog';
import {MatListOption, MatSelectionList} from "@angular/material/list";
import {MatButton} from "@angular/material/button";
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";

@Component({
	selector: 'app-new-conversation-dialog',
	imports: [
		CommonModule,
		MatSelectionList,
		MatListOption,
		MatDialogActions,
		MatButton,
		MatDialogContent,
		MatDialogTitle,
		FormsModule
	],
	templateUrl: 'new-conversation-dialog.component.html',
	styleUrls: ['new-conversation-dialog.component.scss']
})
export class NewConversationDialogComponent {
	title = '';
	selectedClass: string | null = null;
	selectedUsers: string[] = [];

	constructor(
		public dialogRef: MatDialogRef<NewConversationDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {}

	// isValid(): boolean {
	// 	return this.title.length > 0 &&
	// 		(this.selectedClass !== null || this.selectedUsers.length > 0);
	// }

	isValid(): boolean {
		return this.selectedClass !== null || this.selectedUsers.length > 0;
	}

	onCreate() {
		this.dialogRef.close({
			selectedClass: this.selectedClass,
			selectedUsers: this.selectedUsers
		});
	}

	onCancel() {
		this.dialogRef.close();
	}
}