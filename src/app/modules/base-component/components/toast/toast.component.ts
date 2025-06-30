import {Component, inject, OnInit} from '@angular/core';
import {ToastService} from "../../services/toast/toast.service";
import {CommonModule} from "@angular/common";
import {animate, style, transition, trigger} from '@angular/animations';

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
           aria-atomic="true"
           [@fadeInOut]>
        <div class="d-flex">
          <div class="toast-body text-white">
            {{ toast.message }}
          </div>
          <button type="button"
                  class="btn-close btn-close-white me-2 m-auto"
                  (click)="close(toast.id)"
                  aria-label="Close"></button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bg-success { background-color: #28a745 !important; }
    .bg-error { background-color: #dc3545 !important; }
    .bg-warning { background-color: #ffc107 !important; }
    .bg-info { background-color: #17a2b8 !important; }
  `],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out',
            style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in',
            style({ opacity: 0, transform: 'translateX(100%)' }))
      ])
    ])
  ]
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