import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('auth');
    if (token) {
      return true;
    } else {
      router.navigate(['/login']);
      return false;
    }
  }

  // If running on server, don’t block (let hydration continue)
  return true;
};
