import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-growth-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="users-count-indicator">
      <div class="users-count">
        <span class="current-users">{{ currentUsers }}</span>
        <span class="max-users">/{{ maxUsers }}</span>
      </div>
      <div class="users-label">Utilisateurs</div>
    </div>
  `,
  styles: [`
    .users-count-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: sans-serif;
    }
    
    .users-count {
      font-size: 1.2rem;
      font-weight: bold;
    }
    
    .current-users {
      color: #4338ca; /* Couleur pour le nombre actuel */
    }
    
    .max-users {
      color: #64748b; /* Couleur plus discrète pour le max */
    }
    
    .users-label {
      font-size: 0.8rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  `]
})

export class UsersCountIndicatorComponent {
  @Input() currentUsers: number = 0;
  @Input() maxUsers: number = 0;
}


// // growth-indicator.component.ts
// import { Component, Input } from '@angular/core';
// import { CommonModule } from '@angular/common';
//
// @Component({
//   selector: 'app-growth-indicator',
//   standalone: true,
//   imports: [CommonModule],
//   template: `
//     <div class="growth-indicator">
//       <svg width="24" height="24" viewBox="0 0 24 24" [class]="getArrowClass()">
//         <path *ngIf="value > 0" d="M7 14l5-5 5 5H7z" />
//         <path *ngIf="value < 0" d="M7 10l5 5 5-5H7z" />
//         <line *ngIf="value === 0" x1="5" y1="12" x2="19" y2="12" stroke-width="2" />
//       </svg>
//     </div>
//   `,
//   styles: [`
//     .growth-indicator {
//       display: flex;
//       align-items: center;
//       justify-content: center;
//     }
//
//     svg {
//       fill: currentColor;
//       stroke: currentColor;
//     }
//
//     .arrow-up {
//       color: #10b981;
//     }
//
//     .arrow-down {
//       color: #ef4444;
//     }
//
//     .arrow-neutral {
//       color: #64748b;
//     }
//   `]
// })
// export class GrowthIndicatorComponent {
//   @Input() value: number = 0;
//
//   getArrowClass(): string {
//     if (this.value > 0) return 'arrow-up';
//     if (this.value < 0) return 'arrow-down';
//     return 'arrow-neutral';
//   }
// }