import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ToastComponent} from "./modules/base-component/components/toast/toast.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
  template: `
    <router-outlet />
    <app-toast></app-toast>
  `,
  styles: [],
})
export class AppComponent {
  title = 'Smart Tracking Presence';
}
