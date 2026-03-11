import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { LoadingService } from './services/loading';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    @if (loadingService.isLoading()) {
      <div class="global-loader"></div>
    }
    
    <router-outlet></router-outlet>
  `,
  styles: [`
    .global-loader {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899);
      background-size: 200% 100%;
      z-index: 9999;
      animation: loading-wave 1.5s infinite linear;
    }

    @keyframes loading-wave {
      0% { background-position: 100% 0; }
      100% { background-position: -100% 0; }
    }
  `]
})
export class AppComponent {
  loadingService = inject(LoadingService);
  private router = inject(Router);

  constructor() {
    // Listen to routing events to trigger the loading bar during page transitions!
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loadingService.show();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        // Add a tiny artificial delay so it looks smooth even if the page loads instantly
        setTimeout(() => this.loadingService.hide(), 300);
      }
    });
  }
}