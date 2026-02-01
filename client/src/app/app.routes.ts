import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
    { path: '', loadComponent: () => import('../app/pages/home/home').then(m => m.Home) },
    { path: 'register', loadComponent: () => import('../app/pages/register/register').then(m => m.Register) },
    { path: 'login', loadComponent: () => import('../app/pages/login/login').then(m => m.Login) },
    { path: 'invoice', loadComponent: () => import('../app/pages/invoice/invoice').then(m => m.Invoice), canActivate: [authGuard] }
];
