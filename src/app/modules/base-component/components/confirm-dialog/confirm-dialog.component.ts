import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'app-confirm-dialog',
	standalone: true,
	template: `
        <div class="modal-header">
            <h4 class="modal-title">{{title}}</h4>
        </div>
        <div class="modal-body">
            <p>{{message}}</p>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" (click)="cancel()">Annuler</button>
            <button type="button" class="btn btn-danger" (click)="confirm()">Confirmer</button>
        </div>
	`,
})
export class ConfirmDialogComponent {
	title: string = '';
	message: string = '';

	constructor(public activeModal: NgbActiveModal) {}

	confirm(): void {
		this.activeModal.close('confirm');
	}

	cancel(): void {
		this.activeModal.dismiss('cancel');
	}
}