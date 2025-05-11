import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

declare var Plaid: any;

@Injectable({
  providedIn: 'root',
})
export class PlaidService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get a link token from your server
  getLinkToken(): Observable<{ link_token: string }> {
    return this.http.post<{ link_token: string }>(`${this.apiUrl}/plaid/create_link_token`, {});
  }

  // Initialize Plaid Link with the token
  initializePlaidLink(linkToken: string, onSuccess: (public_token: string) => void): void {
    const handler = Plaid.create({
      token: linkToken,
      onSuccess: (public_token: string) => {
        console.log('Link success - public token:', public_token);
        onSuccess(public_token);
      },
      onLoad: () => {
        console.log('Link loaded');
      },
      onExit: (err: any, metadata: any) => {
        console.log('Link exit', err, metadata);
      },
      onEvent: (eventName: string, metadata: any) => {
        console.log('Link event', eventName, metadata);
      },
    });
    
    handler.open();
  }

  // Exchange the public token for an access token
  exchangePublicToken(publicToken: string): Observable<{ access_token: string }> {
    return this.http.post<{ access_token: string }>(`${this.apiUrl}/plaid/exchange_public_token`, {
      public_token: publicToken,
    });
  }

  // Get transactions with the access token
  getTransactions(accessToken: string): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/plaid/transactions`, {
      access_token: accessToken,
    });
  }
}