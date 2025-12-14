import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { setAssetPath } from 'ionicons';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// Configure Ionicons asset base path to avoid URL errors when fetching SVGs
try {
  setAssetPath((document as any).baseURI || '/');
} catch {
  setAssetPath('/');
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
});
