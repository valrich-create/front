import {Component, Input} from '@angular/core';
import {CheckInLocation} from "../../users.models";

@Component({
  selector: 'app-user-check-in-locations',
  standalone: true,
  template: `
    <div class="profile-card">
      <div class="profile-content">
        <div class="section-header">
          <h3 class="section-title">Check-in Locations</h3>
          <a class="see-more">See more</a>
        </div>

        <div class="check-in-locations">
          <div class="card mb-2" *ngFor="let location of locations">
            <div class="card-body py-2">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="mb-0">{{location.name}}</h6>
                  <small class="text-muted">Last check-in: {{location.lastCheckIn | date}}</small>
                </div>
                <span class="badge"
                      [class.bg-success]="location.status === 'active'"
                      [class.bg-secondary]="location.status === 'inactive'">
                  {{location.status | titlecase}}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: ``
})
export class UserCheckInLocationsComponent {
  @Input() locations: CheckInLocation[] = [];
}
