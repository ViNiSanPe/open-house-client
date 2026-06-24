import { Routes } from '@angular/router';

const loadReschedulePage = () =>
  import('./features/reschedule/pages/reschedule-page/reschedule-page').then(
    (page) => page.ReschedulePage,
  );

export const routes: Routes = [
  {
    path: 'invite/:id',
    loadComponent: loadReschedulePage,
  },
  {
    path: 'confirm-presence/:id',
    loadComponent: loadReschedulePage,
  },
  {
    path: '',
    loadComponent: loadReschedulePage,
  },
];
