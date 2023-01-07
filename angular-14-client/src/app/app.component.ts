import { Component } from '@angular/core';
import { StorageService } from './_services/storage.service';
import { AuthService } from './_services/auth.service';
import {
  AUTO_STYLE,
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

const DEFAULT_DURATION = 300;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('collapse', [
      state('false', style({ height: AUTO_STYLE, visibility: AUTO_STYLE })),
      state('true', style({ height: '0', visibility: 'hidden' })),
      transition('false => true', animate(DEFAULT_DURATION + 'ms ease-in')),
      transition('true => false', animate(DEFAULT_DURATION + 'ms ease-out')),
    ]),
  ],
})
export class AppComponent {
  private roles: string[] = [];
  isLoggedIn = false;
  showAdminBoard = false;
  showModeratorBoard = false;
  username?: string;

  navbarCollapsed = true;
  nav_class = 'navbar-collapse collapse';

  constructor(
    private storageService: StorageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.storageService.isLoggedIn();

    if (this.isLoggedIn) {
      const user = this.storageService.getUser();
      this.roles = user.roles;

      this.showAdminBoard = this.roles.includes('ADMIN');
      this.showModeratorBoard = this.roles.includes('MODERATOR');

      this.username = user.username;
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: (res) => {
        console.log(res);
        this.storageService.clean();
      },
      error: (err) => {
        console.log(err);
      },
    });

    window.location.reload();
  }

  collapse() {
    this.navbarCollapsed = !this.navbarCollapsed
    this.nav_class = `navbar-collapse collapse ${this.navbarCollapsed ? 'show' : ''}`;
  }
}
