import {Component, inject, OnInit} from '@angular/core';
import {ToastService} from "../../services/toast/toast.service";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <div *ngFor="let toast of toasts"
           class="toast show"
           [ngClass]="'bg-' + toast.type"
           role="alert"
           aria-live="assertive"
           aria-atomic="true">
        <div class="toast-header">
          <strong class="me-auto" [ngClass]="'text-' + toast.type">Notification</strong>
          <button type="button" class="btn-close" (click)="close(toast.id)"></button>
        </div>
        <div class="toast-body text-white">
          {{ toast.message }}
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ToastComponent implements OnInit {
  private toastService = inject(ToastService);
  toasts: any[] = [];

  ngOnInit(): void {
    this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  close(id: number): void {
    this.toastService.remove(id);
  }
}
