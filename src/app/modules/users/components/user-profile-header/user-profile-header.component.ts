import {Component, Input} from '@angular/core';
import {User} from "../../users.models";

@Component({
  selector: 'app-user-profile-header',
  standalone: true,
  template: `
    <div class="profile-card">
      <div class="profile-header">
        <div class="circle-decoration"></div>
        <div class="circle-decoration-2"></div>
      </div>
      <div class="profile-avatar">
        <span class="initials">{{getInitials(user?.name)}}</span>
      </div>

      <div class="profile-content">
        <h2 class="profile-name">{{user?.name}}</h2>
        <div class="profile-title">{{user?.function}}</div>

        <div class="profile-info">
          <div class="profile-info-item">
            <div class="profile-info-icon icon-location">
              <i class="fas fa-map-marker-alt"></i>
            </div>
            <span>{{user?.city}}, {{user?.country}}</span>
          </div>

          <div class="profile-info-item">
            <div class="profile-info-icon icon-phone">
              <i class="fas fa-phone"></i>
            </div>
            <span>{{user?.phone}}</span>
          </div>

          <div class="profile-info-item">
            <div class="profile-info-icon icon-email">
              <i class="fas fa-envelope"></i>
            </div>
            <span>{{user?.email}}</span>
          </div>
        </div>

        <div class="about-section">
          <h3 class="section-title">About:</h3>
          <p>{{user?.bio || 'No biography available'}}</p>
        </div>

        <div class="education-section">
          <h3 class="section-title">Education:</h3>
          <ul class="list-unstyled">
            <li class="education-item" *ngFor="let edu of user?.education">
              <div><i class="fas fa-circle-dot me-2"></i>{{edu.degree}}, {{edu.institution}}</div>
              <div class="education-year">{{edu.yearFrom}} - {{edu.yearTo}}</div>
            </li>
          </ul>
        </div>

        <div class="expertise-section">
          <h3 class="section-title">Expertise:</h3>
          <div class="expertise-tags">
            <span *ngFor="let skill of user?.expertise">{{skill}}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: ``
})

export class UserProfileHeaderComponent {
  @Input() user: User | null = null;

  getInitials(name?: string): string {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}
