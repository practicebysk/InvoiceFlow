import { Component, inject, OnInit } from '@angular/core';
import { Api } from '../services/api';
import { FormsModule } from '@angular/forms';
import { Navigate } from '../services/navigate';
import { Common } from '../services/common';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register implements OnInit {
  form = { email: '', password: '', shopName: '', shopAddress: '' };
  commonService = inject(Common);
  
  constructor(private api: Api, public navigate: Navigate) { }

  ngOnInit(): void {
    if (this.commonService.getLocalStroge('auth')) {
      this.navigate.navigate('/invoice');
    }
  }

  register() {
    this.api.register(this.form).subscribe({
      next: () => alert('Registered successfully!'),
    });
  }
}
