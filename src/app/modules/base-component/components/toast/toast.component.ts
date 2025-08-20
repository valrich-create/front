import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {Toast, ToastService} from "../../services/toast/toast.service";
import {CommonModule} from "@angular/common";
import {animate, style, transition, trigger} from '@angular/animations';
import {Subscription} from "rxjs";

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toasts"
           class="toast-item"
           [class]="'toast-' + toast.type"
           [@slideIn]>

        <!-- Header coloré avec titre et bouton fermer -->
        <div class="toast-header">
          <div class="toast-title">
            <i [class]="getIconClass(toast.type)"></i>
            {{ toast.title }}
          </div>
          <button class="toast-close" (click)="removeToast(toast.id)">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Corps avec message sur fond blanc - affiché seulement si message valide -->
        <div class="toast-body" *ngIf="toast.message && toast.message.trim().length > 0">
          {{ toast.message }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 400px;
    }

    .toast-item {
      margin-bottom: 10px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      animation: slideIn 0.3s ease-out;
      min-width: 300px;
    }

    .toast-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      color: white;
      font-weight: 600;
      font-size: 14px;
    }

    .toast-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .toast-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      opacity: 0.8;
      transition: opacity 0.2s;
    }

    .toast-close:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.1);
    }

    .toast-body {
      background: white;
      padding: 16px;
      color: #374151;
      font-size: 14px;
      line-height: 1.5;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }

    /* Couleurs pour les différents types */
    .toast-success .toast-header {
      background: linear-gradient(135deg, #10b981, #059669);
    }

    .toast-danger .toast-header {
      background: linear-gradient(135deg, #ef4444, #dc2626);
    }

    .toast-warning .toast-header {
      background: linear-gradient(135deg, #f59e0b, #d97706);
    }

    .toast-info .toast-header {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
    }

    /* Animation */
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    /* Responsive */
    @media (max-width: 480px) {
      .toast-container {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
      }

      .toast-item {
        min-width: auto;
      }
    }
    .bg-success { background-color: #28a745 !important; }
    .bg-error { background-color: #dc3545 !important; }
    .bg-warning { background-color: #ffc107 !important; }
    .bg-info { background-color: #17a2b8 !important; }
  `],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(100%)' }))
      ])
    ])
  ]
})
export class ToastComponent implements OnInit, OnDestroy {

  toasts: Toast[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.toasts$.subscribe(
        toasts => this.toasts = toasts
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  removeToast(id: number): void {
    this.toastService.remove(id);
  }

  getIconClass(type: string): string {
    const icons = {
      success: 'fas fa-check-circle',
      danger: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };
    return icons[type as keyof typeof icons] || 'fas fa-bell';
  }

  close(id: number): void {
    this.toastService.remove(id);
  }
}