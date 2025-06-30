import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {provideHttpClient, withFetch, withInterceptors} from "@angular/common/http";
import {authInterceptor} from "./modules/auth/service/auth.interceptor";
import {apiPrefixInterceptor} from "./core/interceptors/api-prefix.interceptor";
import {provideAnimationsAsync} from "@angular/platform-browser/animations/async";

export const appConfig: ApplicationConfig = {
  providers: [
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(routes),
      provideAnimationsAsync(),
      provideClientHydration(withEventReplay()),
      provideHttpClient(
          withInterceptors([
              apiPrefixInterceptor,
              authInterceptor
          ]),
          withFetch()
      )
  ]
};
