import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subscription, Payment, UsageLog } from '../models/subscription.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getSubscriptions(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${this.apiUrl}/subscriptions`);
  }

  getSubscription(id: number): Observable<Subscription> {
    console.log(`Fetching subscription with ID: ${id}`);
    return this.http.get<Subscription>(`${this.apiUrl}/subscriptions/${id}`);
  }

  addSubscription(subscription: Subscription): Observable<Subscription> {
    return this.http.post<Subscription>(`${this.apiUrl}/subscriptions`, subscription);
  }

  updateSubscription(id: number, subscription: Subscription): Observable<Subscription> {
    return this.http.put<Subscription>(`${this.apiUrl}/subscriptions/${id}`, subscription);
  }

  deleteSubscription(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/subscriptions/${id}`);
  }

  getPayments(subId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/subscriptions/${subId}/payments`);
  }

  addPayment(payment: Payment): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/payments`, payment);
  }

  getUsageLogs(subId: number): Observable<UsageLog[]> {
    return this.http.get<UsageLog[]>(`${this.apiUrl}/subscriptions/${subId}/usage-logs`);
  }

  addUsageLog(log: UsageLog): Observable<UsageLog> {
    return this.http.post<UsageLog>(`${this.apiUrl}/usage-logs`, log);
  }

  // Plaid integration methods
  createLinkToken(): Observable<{ link_token: string }> {
    return this.http.post<{ link_token: string }>(`${this.apiUrl}/plaid/create_link_token`, {});
  }

  exchangePublicToken(publicToken: string): Observable<{ access_token: string }> {
    return this.http.post<{ access_token: string }>(`${this.apiUrl}/plaid/exchange_public_token`, { public_token: publicToken });
  }

  fetchTransactions(accessToken: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/plaid/transactions`, { access_token: accessToken });
  }
}