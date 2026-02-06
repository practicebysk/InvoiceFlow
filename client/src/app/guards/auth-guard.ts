import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Common } from '../services/common';
import { Navigate } from '../services/navigate';

export const authGuard: CanActivateFn = () => {
  const common = inject(Common);
  const navigate = inject(Navigate);
  if (common.isBrowser) {
    const token = common.getAuthToken()
    if (token) {
      return true;
    } else {
      navigate.openLoginPage();
      return false;
    }
  }
  return true;
};
