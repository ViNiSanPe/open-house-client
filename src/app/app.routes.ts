import { Routes } from '@angular/router';
import { HomePage } from './features/home/pages/home-page/home-page';

export const routes: Routes = [
  {
    path: 'invite/:id',
    component: HomePage,
    data: {
      flow: 'invite'
    }
  },
  {
    path: 'confirm-presence/:id',
    component: HomePage,
    data: {
      flow: 'confirm'
    }
  },
  {
    path: '',
    redirectTo: '/invite/demo',
    pathMatch: 'full'
  }
];
