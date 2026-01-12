import { Component, inject, OnInit } from '@angular/core';
import { Api } from '../../services/api';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Navigate } from '../../services/navigate';
import { Common } from '../../services/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit {
  form = { email: '', password: '' };
  loading = false;
  error = '';
  hidePassword = true;
  commonService = inject(Common);

  constructor(private api: Api, private router: Router, public navigate: Navigate) { }

  ngOnInit(): void {
    if (this.commonService.getLocalStroge('auth')) {
      this.navigate.navigate('/invoice');
    }
  }

  login() {
    if (!this.form.email || !this.form.password) {
      this.error = 'Please enter email and password';
      return;
    }

    this.loading = true;
    this.error = '';

    this.api.login(this.form).subscribe({
      next: (res: any) => {
        this.loading = false;
        const token =
          res?.access ||
          res?.accessToken ||
          res?.token ||
          (res && res.access) ||
          (res && res.accessToken) ||
          null;
        if (token) {
          localStorage.setItem('auth', token); 
        } else {
          localStorage.setItem('auth', 'true');
        }
        this.router.navigate(['/invoice']);
      }
    });
  }

  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }

  onKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.login();
    }
  }
}
