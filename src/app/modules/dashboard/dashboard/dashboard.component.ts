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
import {ToastService} from "../../base-component/services/toast/toast.service";

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
  topByExistingUsers: TopEstablishmentByUsersResponse[] | undefined;
  topByTotalUsers: TopEstablishmentByUsersResponse[] | undefined;
  isLoading: boolean = true;

  constructor(
      private route: ActivatedRoute,
      private organizationService: OrganizationService,
      private toast: ToastService,
      private eventService: EventService
  ) { }

  // async ngOnInit(): Promise<void>  {
  //   this.loadUserData();
  //   await this.loadEstablishmentData();
  //
  //   if (this.currentEstablishment) {
  //     this.loadDashboardData();
  //   }
  // }

  async ngOnInit(): Promise<void> {
    try {
      await this.loadUserData(); // Charge d'abord les données utilisateur

      if (this.isSuperAdmin()) {
        await this.loadSuperAdminDashboard();
      } else {
        await this.loadEstablishmentData();
        if (this.currentEstablishment) {
          await this.loadOrganizationDashboard();
        } else {
          this.toast.show("No data found", "warning");
        }
      }
    } catch (error) {
      console.error("Dashboard loading error:", error);
      this.toast.show("Error Occurred", "danger");
    } finally {
      this.isLoading = false;
    }
  }

  private isSuperAdmin(): boolean {
    return this.userRole === 'SUPER_ADMIN';
  }

  private async loadUserData(): Promise<void> {
    const storage = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
    if (!storage) throw new Error('No user data found');

    const userData = JSON.parse(storage);
    this.userFullName = `${userData.firstName ?? ''} ${userData.lastName ?? ''}`.trim();
    this.userEmail = userData.email ?? '';
    this.userPhone = userData.phoneNumber ?? '';
    this.userRole = userData.role ?? '';
  }

  private async loadEstablishmentData(): Promise<void> {
    try {
      // 1. Essayer depuis l'URL
      const routeId = this.route.snapshot.paramMap.get('id');
      if (routeId) {
        this.currentEstablishment = await this.organizationService
            .getEstablishmentById(routeId)
            .toPromise();
        return;
      }

      // 2. Essayer depuis le storage
      const storage = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
      const userData = JSON.parse(storage || '{}');

      if (userData.establishment?.id) {
        this.currentEstablishment = await this.organizationService
            .getEstablishmentById(userData.establishment.id)
            .toPromise();
      }
    } catch (error) {
      console.warn("Establishment loading warning:", error);
      // Ne pas throw ici pour continuer le flux
    }
  }

  private async loadSuperAdminDashboard(): Promise<void> {
    try {
      const [globalStats, topExisting, topTotal] = await Promise.all([
        this.organizationService.getGlobalStatistics().toPromise(),
        this.organizationService.getTop10EstablishmentsByExistingUsers().toPromise(),
        this.organizationService.getTop10EstablishmentsByTotalUsers().toPromise()
      ]);

      this.globalStats = globalStats;
      this.topByExistingUsers = topExisting;
      this.topByTotalUsers = topTotal;

      this.toast.show("Dashboard loading successfully", "success");
    } catch (error) {
      console.error("SuperAdmin dashboard error:", error);
      throw error;
    }
  }

  private async loadOrganizationDashboard(): Promise<void> {
    try {
      const [metrics, dailyStats, yearlyStats] = await Promise.all([
        this.organizationService.getUserMetrics(this.establishmentId).toPromise(),
        this.organizationService.getDailyGlobalStats(this.establishmentId).toPromise(),
        this.organizationService.getYearlyPresenceStats(this.establishmentId, this.currentYear).toPromise()
      ]);

      this.userMetrics = metrics;
      this.dailyStats = dailyStats;
      this.yearlyStats = yearlyStats;

      this.toast.show("Dashboard organisation chargé", "success");
    } catch (error) {
      console.error("Organization dashboard error:", error);
      throw error;
    }
  }

  // async ngOnInit(): Promise<void> {
  //   try {
  //     this.loadUserAndEstablishmentData();
  //     if (this.currentEstablishment) {
  //       this.loadDashboardData();
  //     } else {
  //       this.toast.show("No Data found", "warning");
  //     }
  //   } catch (error) {
  //     this.toast.show("Error occurred", "danger");
  //   }
  // }

  get establishmentId(): string {
    return this.currentEstablishment?.id || '';
  }

  get establishmentName(): string {
    return this.currentEstablishment?.nom || '';
  }

  // private async loadEstablishmentData(): Promise<void> {
  //   // 1. Essayer de récupérer depuis l'URL
  //   const routeId = this.route.snapshot.paramMap.get('id');
  //
  //   if (routeId) {
  //     try {
  //       this.currentEstablishment = await this.organizationService
  //           .getEstablishmentById(routeId).toPromise();
  //       return;
  //     } catch (error) {
  //       console.warn('Établissement non trouvé via URL, tentative via storage');
  //     }
  //   }
  //
  //   // 2. Récupérer depuis le storage
  //   const storage = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
  //   if (!storage) return;
  //
  //   try {
  //     const userData = JSON.parse(storage);
  //     if (userData.establishment?.id) {
  //       this.currentEstablishment = await this.organizationService
  //           .getEstablishmentById(userData.establishment.id).toPromise();
  //     }
  //   } catch (error) {
  //     console.error('Erreur lecture données établissement', error);
  //   }
  // }
  //
  // private loadUserData(): void {
  //   const storage = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
  //   if (!storage) return;
  //
  //   try {
  //     const userData = JSON.parse(storage);
  //     this.isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(userData.role);
  //     this.userFullName = `${userData.firstName ?? ''} ${userData.lastName ?? ''}`.trim();
  //     this.userEmail = userData.email ?? '';
  //     this.userPhone = userData.phoneNumber ?? '';
  //     this.userRole = userData.role ?? '';
  //   } catch (error) {
  //     console.error('Erreur lecture données utilisateur', error);
  //   }
  // }

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
