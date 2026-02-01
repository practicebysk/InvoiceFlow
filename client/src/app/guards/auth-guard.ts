import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Common } from '../services/common';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const common = inject(Common);
  if (common.getAuthToken()) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
