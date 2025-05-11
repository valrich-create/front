// bar-chart.component.ts
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <div class="bars">
        <div 
          *ngFor="let value of userStats; let i = index" 
          class="bar"
          [style.height.%]="getBarHeight(value)"
          [class.active]="i === selectedBarIndex">
          <div class="bar-value" *ngIf="showValues">{{value}}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      width: 100%;
      height: 3rem;
      display: flex;
      align-items: flex-end;
    }
    
    .bars {
      display: flex;
      width: 100%;
      height: 100%;
      gap: 0.2rem;
      align-items: flex-end;
    }
    
    .bar {
      flex: 1;
      background-color: #e2e8f0;
      border-radius: 2px;
      position: relative;
      min-height: 2px;
    }
    
    .bar.active {
      background-color: #4338ca;
    }
    
    .bar-value {
      position: absolute;
      top: -1.5rem;
      width: 100%;
      text-align: center;
      font-size: 0.7rem;
      color: #4338ca;
    }
  `]
})
export class BarChartComponent implements OnChanges {
  @Input() userStats: number[] = [];
  @Input() showValues: boolean = true;
  selectedBarIndex = new Date().getDay();
  maxValue = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userStats']) {
      this.calculateMaxValue();
    }
  }

  calculateMaxValue(): void {
    if (this.userStats?.length > 0) {
      this.maxValue = Math.max(...this.userStats);
      // Minimum de 10 pour éviter une échelle trop petite
      this.maxValue = Math.max(this.maxValue, 1);
    }
  }

  getBarHeight(value: number): number {
    if (!value || this.maxValue === 0) return 0;
    return (value / this.maxValue) * 100;
  }
}

// // bar-chart.component.ts
// import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
// import { CommonModule } from '@angular/common';
//
// @Component({
//   selector: 'app-bar-chart',
//   standalone: true,
//   imports: [CommonModule],
//   template: `
//     <div class="chart-container">
//       <div class="bars">
//         <div
//           *ngFor="let item of data; let i = index"
//           class="bar"
//           [style.height.%]="data"
//           [class.active]="i === selectedBarIndex">
//         </div>
//       </div>
//     </div>
//   `,
//   styles: [`
//     .chart-container {
//       width: 3rem;
//       height: 2.5rem;
//       display: flex;
//       align-items: flex-end;
//     }
//
//     .bars {
//       display: flex;
//       width: 100%;
//       height: 100%;
//       gap: 0.2rem;
//       align-items: flex-end;
//     }
//
//     .bar {
//       flex-grow: 1;
//       background-color: #e2e8f0;
//       border-radius: 2px;
//     }
//
//     .bar.active {
//       background-color: #4338ca;
//     }
//   `]
// })
// export class BarChartComponent implements OnChanges {
//   @Input() data: number[] = [];
//   selectedBarIndex = 0;
//   maxValue = 100;
//   //
//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['data']) {
//     }
//   }
//
//   calculateMaxValue(): void {
//     if (this.data && this.data.length > 0) {
//       this.maxValue = Math.max(...this.data);
//     }
//   }
//
//   getBarHeight(value: number): number {
//     return (value / this.maxValue) * 100;
//   }
// }