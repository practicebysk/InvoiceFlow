import { Routes } from '@angular/router';
import { Register } from './register/register';
import { Login } from './pages/login/login';
import { Invoice } from './pages/invoice/invoice';
import { authGuard } from './guards/auth-guard';
import { Home } from './pages/home/home';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'register', component: Register },
    { path: 'login', component: Login },
    { path: 'invoice', component: Invoice, canActivate: [authGuard] }
];
