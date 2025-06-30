import { Component, Input, OnChanges, OnInit, SimpleChanges, Inject, PLATFORM_ID } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { CommonModule, isPlatformBrowser } from "@angular/common";

Chart.register(...registerables);

@Component({
	selector: 'app-school-performance-chart',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './school-performance-chart.component.html',
	styleUrls: ['./school-performance-chart.component.scss']
})
export class SchoolPerformanceChartComponent implements OnInit, OnChanges {
	@Input() yearlyPresenceStats: YearlyPresenceStatsResponse | undefined;
	@Input() currentYear: number = new Date().getFullYear();
	@Input() previousYear: number = new Date().getFullYear() - 1;

	chart: any;
	monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	constructor(@Inject(PLATFORM_ID) private platformId: Object) {
	}

	ngOnInit(): void {
		if (isPlatformBrowser(this.platformId)) {
			this.createChart();
		}
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['yearlyPresenceStats'] && this.chart) {
			this.updateChartData();
		}
	}

	createChart() {
		if (!isPlatformBrowser(this.platformId)) return;

		setTimeout(() => {
			const ctx = document.getElementById('schoolPerformanceChart') as HTMLCanvasElement;
			this.chart = new Chart(ctx, {
				type: 'line',
				data: this.getChartData(),
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: {
							display: false
						}
					},
					scales: {
						y: {
							beginAtZero: true,
							max: 100,
							ticks: {
								stepSize: 25,
								callback: (value) => `${value}%`
							}
						}
					}
				}
			});
		}, 100);
	}

	updateChartData() {
		if (!this.chart) return;

		const newData = this.getChartData();
		this.chart.data.labels = newData.labels;
		this.chart.data.datasets[0].data = newData.datasets[0].data;
		this.chart.data.datasets[1].data = newData.datasets[1].data;
		this.chart.update();
	}

	private getChartData() {
		// Default data if no stats are provided
		const defaultData = Array(12).fill(0);
		const currentYearData = this.yearlyPresenceStats?.monthlyStats
			? this.getMonthlyPresenceRates(this.yearlyPresenceStats.monthlyStats)
			: defaultData;

		// For previous year, we don't have the data from the service, so we'll use default
		// In a real app, you might want to fetch previous year data separately
		const previousYearData = defaultData;

		return {
			labels: this.monthNames,
			datasets: [
				{
					label: this.currentYear.toString(),
					data: currentYearData,
					borderColor: '#ffb84d',
					backgroundColor: 'rgba(255, 184, 77, 0.2)',
					tension: 0.4,
					fill: true
				},
				{
					label: this.previousYear.toString(),
					data: previousYearData,
					borderColor: '#ff7a59',
					backgroundColor: 'rgba(255, 122, 89, 0.2)',
					tension: 0.4,
					fill: true
				}
			]
		};
	}

	private getMonthlyPresenceRates(monthlyStats: { month: number, presenceCount: number, absenceCount: number }[]): number[] {
		const rates = Array(12).fill(0);

		if (!Array.isArray(monthlyStats)) return [];
		monthlyStats.forEach(stat => {
			const total = stat.presenceCount + stat.absenceCount;
			const rate = total > 0 ? Math.round((stat.presenceCount / total) * 100) : 0;
			rates[stat.month - 1] = rate; // month is 1-12, array is 0-11
		});

		return rates;
	}
}

interface YearlyPresenceStatsResponse {
	year: number;
	monthlyStats: {
		month: number;
		presenceCount: number;
		absenceCount: number;
	}[];
}








// import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
// import { Chart, registerables } from 'chart.js';
// import {CommonModule, isPlatformBrowser} from "@angular/common";
//
// Chart.register(...registerables);
//
// @Component({
//   selector: 'app-school-performance-chart',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './school-performance-chart.component.html',
//   styleUrls: ['./school-performance-chart.component.scss']
// })
// export class SchoolPerformanceChartComponent implements OnInit {
//   chart: any;
//   weekStats = {
//     thisWeek: '1.245',
//     lastWeek: '1.356'
//   };
//
//   // constructor() { }
//
//   constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
//
//   ngOnInit(): void {
//     if (isPlatformBrowser(this.platformId)) {
//       this.createChart();
//     }
//   }
//
//   createChart() {
//     setTimeout(() => {
//       const ctx = document.getElementById('schoolPerformanceChart') as HTMLCanvasElement;
//       this.chart = new Chart(ctx, {
//         type: 'line',
//         data: {
//           labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
//           datasets: [
//             {
//               label: 'This Year',
//               data: [20, 75, 38, 10, 30, 55, 25, 60, 25, 74, 50, 40],
//               borderColor: '#ffb84d',
//               backgroundColor: 'rgba(255, 184, 77, 0.2)',
//               tension: 0.4,
//               fill: true
//             },
//             {
//               label: 'Last Year',
//               data: [12, 45, 65, 30, 20, 35, 60, 45, 20, 65, 45, 25],
//               borderColor: '#ff7a59',
//               backgroundColor: 'rgba(255, 122, 89, 0.2)',
//               tension: 0.4,
//               fill: true
//             }
//           ]
//         },
//         options: {
//           responsive: true,
//           maintainAspectRatio: false,
//           plugins: {
//             legend: {
//               display: false
//             }
//           },
//           scales: {
//             y: {
//               beginAtZero: true,
//               max: 100,
//               ticks: {
//                 stepSize: 25
//               }
//             }
//           }
//         }
//       });
//     }, 100);
//   }
// }
