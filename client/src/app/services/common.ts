import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})

export class Common {
    private isBrowser: boolean;

    constructor(private matSnackBar: MatSnackBar) {
        this.isBrowser = typeof window !== 'undefined';
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
}
