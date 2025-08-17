import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  title: string;
  message: string;
  type: 'success' | 'danger' | 'warning' | 'info';
  id: number;
  duration?: number;
}

export interface ToastOptions {
  title?: string;
  message?: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts: Toast[] = [];
  private toastSubject = new Subject<Toast[]>();
  toasts$ = this.toastSubject.asObservable();
  private nextId = 0;

  private getDefaultTitle(type: string): string {
    const titles = {
      success: 'Succès',
      danger: 'Erreur',
      warning: 'Attention',
      info: 'Information'
    };
    return titles[type as keyof typeof titles] || 'Notification';
  }

  private formatErrorMessage(error: any): string {
    // Gestion des erreurs avec structure backend
    if (error?.error?.message) {
      return error.error.message;
    }

    if (error?.message) {
      return error.message;
    }

    // Gestion des erreurs sous forme de string
    if (typeof error === 'string') {
      return error;
    }

    // Gestion des erreurs HTTP avec status
    if (error?.status) {
      switch (error.status) {
        case 400:
          return 'Requête invalide. Veuillez vérifier vos données.';
        case 401:
          return 'Vous n\'êtes pas autorisé à effectuer cette action.';
        case 403:
          return 'Accès refusé.';
        case 404:
          return 'Ressource non trouvée.';
        case 500:
          return 'Erreur interne du serveur.';
        default:
          return `Erreur ${error.status}: Problème de connexion au serveur.`;
      }
    }

    // Message par défaut
    return 'Une erreur serveur inattendue s\'est produite.';
  }

  show(messageOrOptions: string | ToastOptions, type: 'success' | 'danger' | 'warning' | 'info', options?: ToastOptions): void {
    let title: string;
    let message: string;
    let duration: number;

    // Gestion des paramètres flexibles
    if (typeof messageOrOptions === 'string') {
      title = options?.title || this.getDefaultTitle(type);
      message = messageOrOptions;
      duration = options?.duration || 8000;
    } else {
      title = messageOrOptions.title || this.getDefaultTitle(type);
      message = messageOrOptions.message || '';
      duration = messageOrOptions.duration || 8000;
    }

    const toast: Toast = {
      title,
      message,
      type,
      id: this.nextId++,
      duration
    };

    this.toasts.push(toast);
    this.toastSubject.next([...this.toasts]);

    // Auto-remove toast
    setTimeout(() => {
      this.remove(toast.id);
    }, duration);
  }

  // Méthodes spécialisées pour chaque type
  success(message: string, options?: ToastOptions): void {
    this.show(message, 'success', options);
  }

  info(message: string, options?: ToastOptions): void {
    this.show(message, 'info', options);
  }

  warning(messageOrError: string | any, options?: ToastOptions): void {
    const message = typeof messageOrError === 'string'
        ? messageOrError
        : this.formatErrorMessage(messageOrError);

    this.show(message, 'warning', options);
  }

  error(messageOrError: string | any, options?: ToastOptions): void {
    const message = typeof messageOrError === 'string'
        ? messageOrError
        : this.formatErrorMessage(messageOrError);

    this.show(message, 'danger', options);
  }

  remove(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.toastSubject.next([...this.toasts]);
  }

  removeAll(): void {
    this.toasts = [];
    this.toastSubject.next([]);
  }
}