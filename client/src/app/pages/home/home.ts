import { Component } from '@angular/core';
import { Navigate } from '../../services/navigate';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

  constructor(public navigate: Navigate) { }

  openRegisterPage() {
    this.navigate.openRegisterPage();
  }

  openLoginPage() {
    this.navigate.openLoginPage();
  }
}
