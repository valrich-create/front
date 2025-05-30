import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { CommonModule } from "@angular/common";
import { Subscription } from 'rxjs';
import {WeeklyPresenceStatsResponse} from "../../../organizations/organization";
import {OrganizationService} from "../../../organizations/organization.service";

Chart.register(...registerables);

@Component({
	selector: 'app-organization-presence-chart',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './organization-presence-chart.component.html',
	styleUrls: ['./organization-presence-chart.component.scss']
})
export class OrganizationPresenceChartComponent implements OnInit, OnDestroy {
	@Input() establishmentId!: string;

	chart: any;
	weekStats = {
		thisWeek: '0',
		lastWeek: '0'
	};
	incomePercentage = 0;
	private dataSubscription?: Subscription;

	constructor(private organizationService: OrganizationService) { }

	ngOnInit(): void {
		this.fetchWeeklyData();
	}

	ngOnDestroy(): void {
		this.dataSubscription?.unsubscribe();
	}

	fetchWeeklyData() {
		this.dataSubscription = this.organizationService.getWeeklyPresenceStats(this.establishmentId)
			.subscribe(data => {
				this.processWeeklyData(data);
				this.createChart();
			});
	}

	processWeeklyData(data: WeeklyPresenceStatsResponse) {
		// Calculate total presence for current and last week
		const currentWeekTotal = data.currentWeek.reduce((sum, day) => sum + day.presenceCount, 0);
		const lastWeekTotal = data.previousWeek.reduce((sum, day) => sum + day.presenceCount, 0);

		this.weekStats = {
			thisWeek: currentWeekTotal.toString(),
			lastWeek: lastWeekTotal.toString()
		};

		this.incomePercentage = data.comparisonPercentage;

		// Prepare chart data
		const chartData = this.prepareChartData(data);
		this.createChart(chartData);
	}

	prepareChartData(data: WeeklyPresenceStatsResponse): { labels: string[], values: number[] } {
		// Map days to short names and extract presence counts
		const labels = data.currentWeek.map(day => {
			const date = new Date(day.day);
			return date.toLocaleDateString('en-US', { weekday: 'short' });
		});

		const values = data.currentWeek.map(day => {
			// Calculate presence rate if you have expected users data
			// Otherwise just use the count
			return day.presenceCount;
		});

		return { labels, values };
	}

	createChart(chartData?: { labels: string[], values: number[] }) {
		// Use default data if none provided
		const labels = chartData?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
		const values = chartData?.values || [0, 0, 0, 0, 0, 0, 0];

		setTimeout(() => {
			const ctx = document.getElementById('organizationPresenceChart') as HTMLCanvasElement;

			// Destroy previous chart if exists
			if (this.chart) {
				this.chart.destroy();
			}

			this.chart = new Chart(ctx, {
				type: 'bar',
				data: {
					labels: labels,
					datasets: [{
						label: 'Presence',
						data: values,
						backgroundColor: [
							'#ffb84d', '#ff7a59', '#5e4dcd', '#ffb84d',
							'#ff7a59', '#5e4dcd', '#ffb84d'
						],
						borderRadius: 6
					}]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: {
							display: false
						},
						tooltip: {
							callbacks: {
								label: (context) => {
									return `Presence: ${context.raw}`;
								}
							}
						}
					},
					scales: {
						y: {
							beginAtZero: true,
							ticks: {
								callback: (value) => `${value}`
							}
						}
					}
				}
			});
		}, 100);
	}
}








// import {Component, OnInit} from '@angular/core';
// import { Chart, registerables } from 'chart.js';
// import {CommonModule} from "@angular/common";
//
// Chart.register(...registerables);
//
// @Component({
//   selector: 'app-organization-presence-chart',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './organization-presence-chart.component.html',
//   styleUrls: ['./organization-presence-chart.component.scss']
// })
// export class OrganizationPresenceChartComponent implements OnInit {
//   chart: any;
//   weekStats = {
//     thisWeek: '1.245',
//     lastWeek: '1.356'
//   };
//   incomePercentage = 42;
//
//   constructor() { }
//
//   ngOnInit(): void {
//     this.createChart();
//   }
//
//   createChart() {
//     setTimeout(() => {
//       const ctx = document.getElementById('organizationPresenceChart') as HTMLCanvasElement;
//       this.chart = new Chart(ctx, {
//         type: 'bar',
//         data: {
//           labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
//           datasets: [{
//             label: 'Presence',
//             data: [95, 59, 35, 81, 56, 55, 42],
//             backgroundColor: [
//               '#ffb84d', '#ff7a59', '#5e4dcd', '#ffb84d',
//               '#ff7a59', '#5e4dcd', '#ffb84d'
//             ],
//             borderRadius: 6
//           }]
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
//               max: 100
//             }
//           }
//         }
//       });
//     }, 100);
//   }
// }
