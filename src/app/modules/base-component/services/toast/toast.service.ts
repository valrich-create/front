import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

export interface Toast {
  message: string;
  type: 'success' | 'danger' | 'warning' | 'info';
  id: number;
}

@Injectable({
  providedIn: 'root'
})

export class ToastService {
  private toasts: Toast[] = [];
  private toastSubject = new Subject<Toast[]>();
  toasts$ = this.toastSubject.asObservable();
  private nextId = 0;

  show(message: string, type: 'success' | 'danger' | 'warning' | 'info'): void {
    const toast: Toast = {
      message,
      type,
      id: this.nextId++
    };

    this.toasts.push(toast);
    this.toastSubject.next([...this.toasts]);

    // Auto-remove toast after 10 seconds
    setTimeout(() => {
      this.remove(toast.id);
    }, 10000);
  }

  remove(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.toastSubject.next([...this.toasts]);
  }
}
