import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SubscriptionListComponent } from './components/subscription-list/subscription-list.component';
import { SubscriptionFormComponent } from './components/subscription-form/subscription-form.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'subscriptions', component: SubscriptionListComponent },
  { path: 'subscriptions/add', component: SubscriptionFormComponent },
  { path: 'subscriptions/edit/:id', component: SubscriptionFormComponent },
  { path: 'analytics', component: AnalyticsComponent },
  { path: '**', redirectTo: '' },
];