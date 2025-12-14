import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PublicGuard implements CanActivate {
  
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    // If user is already authenticated, redirect to home
    if (this.isAuthenticated()) {
      return this.router.createUrlTree(['/twopage']);
    }
    
    return true;
  }

  private isAuthenticated(): boolean {
    // Check if user data exists in localStorage
    const userData = localStorage.getItem('googleUser');
    return !!userData;
  }
}
