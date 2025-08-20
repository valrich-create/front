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

  private getDefaultMessage(type: string): string {
    const messages = {
      success: 'Opération réalisée avec succès.',
      danger: 'Une erreur est survenue.',
      warning: 'Veuillez vérifier les informations saisies.',
      info: 'Nouvelle information disponible.'
    };
    return messages[type as keyof typeof messages] || 'Notification système.';
  }

  private formatErrorMessage(error: any): string {
    // Gestion des erreurs avec structure backend
    if (error?.error?.message && error.error.message.trim()) {
      return error.error.message.trim();
    }

    if (error?.message && error.message.trim()) {
      return error.message.trim();
    }

    // Gestion des erreurs sous forme de string
    if (typeof error === 'string' && error.trim()) {
      return error.trim();
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

  private calculateDuration(message: string): number {
    const baseTime = 5000; // 5 secondes minimum
    const maxTime = 15000; // 15 secondes maximum
    const calculatedTime = Math.max(baseTime, Math.min(maxTime, message.length * 120));
    return calculatedTime;
  }

  private isValidContent(title: string, message: string): boolean {
    const hasValidTitle = !!title && title.trim().length > 0;
    const hasValidMessage = !!message && message.trim().length > 0;
    return hasValidTitle && hasValidMessage;
  }

  show(messageOrOptions: string | ToastOptions, type: 'success' | 'danger' | 'warning' | 'info', options?: ToastOptions): void {
    let title: string;
    let message: string;
    let duration: number;

    // Gestion des paramètres flexibles
    if (typeof messageOrOptions === 'string') {
      title = options?.title || this.getDefaultTitle(type);
      message = messageOrOptions || this.getDefaultMessage(type);
      duration = options?.duration || this.calculateDuration(message);
    } else {
      title = messageOrOptions.title || this.getDefaultTitle(type);
      message = messageOrOptions.message || this.getDefaultMessage(type);
      duration = messageOrOptions.duration || this.calculateDuration(message);
    }

    // Nettoyer les espaces
    title = title.trim();
    message = message.trim();

    // Ne pas afficher le toast si le contenu n'est pas valide
    if (!this.isValidContent(title, message)) {
      console.warn('Toast non affiché: titre ou message vide');
      return;
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
  success(message?: string, options?: ToastOptions): void {
    const finalMessage = message || this.getDefaultMessage('success');
    this.show(finalMessage, 'success', options);
  }

  info(message?: string, options?: ToastOptions): void {
    const finalMessage = message || this.getDefaultMessage('info');
    this.show(finalMessage, 'info', options);
  }

  warning(messageOrError?: string | any, options?: ToastOptions): void {
    let message: string;

    if (!messageOrError) {
      message = this.getDefaultMessage('warning');
    } else {
      message = typeof messageOrError === 'string'
          ? messageOrError
          : this.formatErrorMessage(messageOrError);
    }

    this.show(message, 'warning', options);
  }

  error(messageOrError?: string | any, options?: ToastOptions): void {
    let message: string;

    if (!messageOrError) {
      message = this.getDefaultMessage('danger');
    } else {
      message = typeof messageOrError === 'string'
          ? messageOrError
          : this.formatErrorMessage(messageOrError);
    }

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