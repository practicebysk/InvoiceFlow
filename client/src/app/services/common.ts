import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class Common {
    public isBrowser: boolean;
    public isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(@Inject(PLATFORM_ID) platformId: Object, private matSnackBar: MatSnackBar, private router: Router) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    setLocalStroge(key: string, value: any): void {
        try {
            if (!this.isBrowser) return;
            const data = typeof value === 'string' ? value : JSON.stringify(value);
            sessionStorage.setItem(key, data);
        } catch (error) {
            console.error('LocalStroge Set error;', error);
        }
    }

    getLocalStroge(key: string): string | null {
        if (!this.isBrowser) return null;
        return localStorage.getItem(key);
    }

    removeLocalStroge(key: string) {
        if (this.isBrowser) { localStorage.removeItem(key); }
    }

    getAuthToken(): string | null {
        return this.getLocalStroge('auth');
    }

    isAuthenticatedFun(){
      return this.getAuthToken();
    }

    private defaultConfig: MatSnackBarConfig = {
        duration: 4000,
        horizontalPosition: 'left',
        verticalPosition: 'top'
    };

    private status: any = {
        1: 'snackbar-success',
        2: 'snackbar-error'
    };

    snackBar(message: string, status: number = 2) {
        this.matSnackBar.open(message, 'X', {
            ...this.defaultConfig,
            panelClass: [this.status[status] || 'snackbar-error']
        });
    }

    error(message: string, action = 'Close') {
        this.matSnackBar.open(message, action, {
            ...this.defaultConfig,
            duration: 4000,
            panelClass: ['snackbar-error']
        });
    }

    info(message: string, action = 'Close') {
        this.matSnackBar.open(message, action, {
            ...this.defaultConfig,
            panelClass: ['snackbar-info']
        });
    }

    round2(val: number): number {
        return Math.round((val + Number.EPSILON) * 100) / 100;
    }

    logOut() {
        this.removeLocalStroge('auth');
        this.router.navigate(['/login']);
    }
}
