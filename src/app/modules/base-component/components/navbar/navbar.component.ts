import {Component, Input, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {AuthService} from "../../../auth/service/auth.service";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="d-flex justify-content-between align-items-center py-3 px-4 border-bottom">
      <h2 class="m-0">{{ pageTitle }}</h2>
      <div class="d-flex align-items-center">
        <!-- Bouton d'impression -->
        <button class="btn btn-link" 
                (click)="onPrint()" 
                title="Imprimer">
          <i class="bi bi-printer-fill fs-5"></i>
        </button>
        
        <!-- Informations utilisateur -->
        <div class="ms-3 d-flex align-items-center">
          <span class="me-2 d-none d-md-block">
            <strong>{{ userName }}</strong>
            <br>
            <small class="text-muted">{{ userRole }}</small>
          </span>
          <div class="avatar rounded-circle bg-primary text-white d-flex justify-content-center align-items-center"
               style="width: 45px; height: 45px;">
            {{ userInitials }}
          </div>
        </div>
        
        <!-- Bouton de déconnexion -->
        <button class="btn btn-link ms-3" 
                (click)="onLogout()" 
                title="Déconnexion">
          <i class="bi bi-box-arrow-right fs-5"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .btn-link {
      color: #6c757d;
      text-decoration: none;
      transition: color 0.2s ease;
    }
    .btn-link:hover {
      color: #343a40;
    }
    .avatar {
      font-weight: bold;
    }
    
    /* CSS d'impression - Masquer les éléments de navigation */
    @media print {
      .navbar, .layout, nav, .sidebar, .btn, button {
        display: none !important;
      }
      
      /* Masquer cette navbar lors de l'impression */
      :host {
        display: none !important;
      }
      
      /* Styles généraux pour l'impression */
      body {
        font-family: 'Times New Roman', serif;
        font-size: 12pt;
        line-height: 1.6;
        color: #000;
        background: white;
      }
      
      /* Marges et mise en page pour l'impression */
      @page {
        margin: 2cm;
        size: A4;
      }
      
      /* Contenu principal visible lors de l'impression */
      .main-content, .content, main {
        display: block !important;
        visibility: visible !important;
        position: static !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        border: none !important;
      }
      
      /* Optimisation des titres pour l'impression */
      h1, h2, h3, h4, h5, h6 {
        color: #000;
        page-break-after: avoid;
        margin-top: 0;
      }
      
      /* Éviter les coupures de page dans les éléments importants */
      .card, .table, .form-group {
        page-break-inside: avoid;
      }
      
      /* Styles pour les tableaux en impression */
      table {
        width: 100%;
        border-collapse: collapse;
      }
      
      table, th, td {
        border: 1px solid #000;
      }
      
      th, td {
        padding: 8px;
        text-align: left;
      }
      
      /* Masquer les éléments interactifs */
      .btn, button, input[type="button"], input[type="submit"], 
      .dropdown, .modal, .tooltip, .popover {
        display: none !important;
      }
      
      /* Affichage des liens en impression */
      a[href]:after {
        content: " (" attr(href) ")";
        font-size: 9pt;
        color: #666;
      }
      
      a[href^="#"]:after,
      a[href^="javascript:"]:after {
        content: "";
      }
    }
  `]
})
export class NavbarComponent implements OnInit {
  @Input() pageTitle: string = '';
  userName: string = '';
  userRole: string = '';
  userInitials: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.userName = `${user.firstName} ${user.lastName}`;
      this.userRole = user.role;
      this.userInitials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
  }

  /**
   * Déclenche l'impression native du navigateur
   */
  onPrint(): void {
    window.print();
  }

  /**
   * Déconnecte l'utilisateur via le service d'authentification
   */
  onLogout(): void {
    this.authService.logout().subscribe(
        () => {
          console.log('Logged out successfully');
        },
        (error) => {
          console.error('Error during logout:', error);
        }
    );
  }
}