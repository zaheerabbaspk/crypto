import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    // Check if user is authenticated
    const isAuthenticated = this.isAuthenticated();
    
    if (!isAuthenticated) {
      // Redirect to login page if not authenticated
      return this.router.createUrlTree(['/loginft']);
    }
    
    return true;
  }

  private isAuthenticated(): boolean {
    // Check if user data exists in localStorage
    const userData = localStorage.getItem('googleUser');
    return !!userData;
  }
}
