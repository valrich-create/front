import {Component, OnInit} from '@angular/core';
import {StatisticsCardsComponent} from "../components/statistics-cards/statistics-cards.component";
import { SchoolPerformanceChartComponent } from "../components/school-performance-chart/school-performance-chart.component";
import {OrganizationCalendarComponent} from "../components/organization-calendar/organization-calendar.component";
import { OrganizationPresenceChartComponent } from "../components/organization-presence-chart/organization-presence-chart.component";
import { RecentAdministrationActivityComponent } from "../components/recent-administration-activity/recent-administration-activity.component";
import {RecentStudentsComponent} from "../components/recent-students/recent-students.component";
import {DashboardMessagesComponent} from "../components/dashboard-messages/dashboard-messages.component";
import {CommonModule} from "@angular/common";
import {LayoutComponent} from "../../base-component/components/layout/layout.component";
import {NavbarComponent} from "../../base-component/components/navbar/navbar.component";
import {
  DailyGlobalStatsResponse, Establishment, GlobalStatsResponse, TopEstablishmentByUsersResponse,
  UserMetricsResponse,
  YearlyPresenceStatsResponse
} from "../../organizations/organization";
import {OrganizationService} from "../../organizations/organization.service";
import {EventService} from "../../events/events.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    StatisticsCardsComponent,
    SchoolPerformanceChartComponent,
    OrganizationCalendarComponent,
    OrganizationPresenceChartComponent,
    RecentAdministrationActivityComponent,
    RecentStudentsComponent,
    DashboardMessagesComponent,
    LayoutComponent,
    NavbarComponent
  ],
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  userFullName: string = '';
  userEmail: string = '';
  userPhone: string = '';
  userRole: string = '';
  // currentEstablishmentId: string = '';
  // establishmentName: string = '';
  currentEstablishment?: Establishment;

  currentYear: number = new Date().getFullYear();
  previousYear = this.currentYear - 1;

  // Données pour les composants enfants
  userMetrics?: UserMetricsResponse;
  dailyStats?: DailyGlobalStatsResponse;
  yearlyStats?: YearlyPresenceStatsResponse;

  isAdmin: boolean = false;
  globalStats?: GlobalStatsResponse;
  topByExistingUsers: TopEstablishmentByUsersResponse[] = [];
  topByTotalUsers: TopEstablishmentByUsersResponse[] = [];

  constructor(
      private route: ActivatedRoute,
      private organizationService: OrganizationService,
      private eventService: EventService
  ) { }

  async ngOnInit(): Promise<void>  {
    this.loadUserData();
    await this.loadEstablishmentData();

    if (this.currentEstablishment) {
      this.loadDashboardData();
    }
  }

  get establishmentId(): string {
    return this.currentEstablishment?.id || '';
  }

  get establishmentName(): string {
    return this.currentEstablishment?.nom || '';
  }

  private async loadEstablishmentData(): Promise<void> {
    // 1. Essayer de récupérer depuis l'URL
    const routeId = this.route.snapshot.paramMap.get('id');

    if (routeId) {
      try {
        this.currentEstablishment = await this.organizationService
            .getEstablishmentById(routeId).toPromise();
        return;
      } catch (error) {
        console.warn('Établissement non trouvé via URL, tentative via storage');
      }
    }

    // 2. Récupérer depuis le storage
    const storage = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
    if (!storage) return;

    try {
      const userData = JSON.parse(storage);
      if (userData.establishment?.id) {
        this.currentEstablishment = await this.organizationService
            .getEstablishmentById(userData.establishment.id).toPromise();
      }
    } catch (error) {
      console.error('Erreur lecture données établissement', error);
    }
  }

  private loadUserData(): void {
    const storage = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
    if (!storage) return;

    try {
      const userData = JSON.parse(storage);
      this.isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(userData.role);
      this.userFullName = `${userData.firstName ?? ''} ${userData.lastName ?? ''}`.trim();
      this.userEmail = userData.email ?? '';
      this.userPhone = userData.phoneNumber ?? '';
      this.userRole = userData.role ?? '';
    } catch (error) {
      console.error('Erreur lecture données utilisateur', error);
    }
  }

  private loadUserAndEstablishmentData(): void {
    const storage = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
    if (!storage) {
      console.warn('Aucune donnée utilisateur trouvée.');
      return;
    }

    try {
      const userData = JSON.parse(storage);
      this.isAdmin = ['SUPER_ADMIN'].includes(userData.role);

      // Données utilisateur
      this.userFullName = `${userData.firstName ?? ''} ${userData.lastName ?? ''}`.trim();
      this.userEmail = userData.email ?? '';
      this.userPhone = userData.phoneNumber ?? '';
      this.userRole = userData.role ?? '';

      // Données établissement (imbriquées dans userData)
      const establishment = userData.establishment;
      if (establishment) {

        // Charger les données spécifiques du tableau de bord
        if (this.establishmentId) {
          if (this.isAdmin) {
            this.loadSuperAdminDashboardData();
          } else {
            this.loadDashboardData();
          }
        }
      } else {
        console.warn('Aucun établissement trouvé dans les données utilisateur.');
      }

    } catch (error) {
      console.error('Erreur lors de la lecture des données utilisateur:', error);
    }
  }

  private loadDashboardData(): void {
    if (!this.currentEstablishment) return;

    console.log(`Chargement dashboard pour ${this.establishmentName} (${this.establishmentId})`);

    if (this.isAdmin) {
      this.loadSuperAdminDashboardData();
    } else {
      // Chargement des métriques utilisateurs
      this.organizationService.getUserMetrics(this.establishmentId)
          .subscribe({
            next: metrics => this.userMetrics = metrics,
            error: err => console.error('Failed to load user metrics', err)
          });

      // Chargement des stats quotidiennes
      this.organizationService.getDailyGlobalStats(this.establishmentId)
          .subscribe(stats => this.dailyStats = stats);

      // Chargement des stats annuelles
      this.organizationService.getYearlyPresenceStats(this.establishmentId, this.currentYear)
          .subscribe(stats => this.yearlyStats = stats);
    }
  }

  private loadSuperAdminDashboardData(): void {
    // Chargement des statistiques globales
    this.organizationService.getGlobalStatistics().subscribe({
      next: stats => this.globalStats = stats,
      error: err => console.error('Failed to load global stats', err)
    });

    // Chargement du top 10 par utilisateurs existants
    this.organizationService.getTop10EstablishmentsByExistingUsers().subscribe({
      next: data => this.topByExistingUsers = data,
      error: err => console.error('Failed to load top by existing users', err)
    });

    // Chargement du top 10 par capacité totale
    this.organizationService.getTop10EstablishmentsByTotalUsers().subscribe({
      next: data => this.topByTotalUsers = data,
      error: err => console.error('Failed to load top by total users', err)
    });
  }
}
