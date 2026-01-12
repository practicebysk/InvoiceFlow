import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})

export class Navigate {
    constructor(private router: Router) { }

    openRegisterPage() {
        this.router.navigate(['/register']);
    }
    openLoginPage() {
        this.router.navigate(['/login']);
    }
    navigate(url: string) {
        this.router.navigate([url]);
    }
}
