import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { SubscriptionService } from '../../services/subscription.service';
import { PlaidService } from '../../services/plaid.service';
import { Subscription } from '../../models/subscription.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule, MatButtonModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  totalMonthlySpend: number = 0;
  upcomingSubscriptions: Subscription[] = [];
  errorMessage: string | null = null;

  constructor(
    private subscriptionService: SubscriptionService,
    private plaidService: PlaidService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.subscriptionService.getSubscriptions().subscribe({
      next: (data) => {
        console.log('Subscriptions fetched:', data); // Debug log
        // Calculate total monthly spend by reducing price values
        this.totalMonthlySpend = data.reduce((sum, sub) => sum + parseFloat(sub.price), 0);
        // Filter upcoming subscriptions for the next 7 days
        const today = new Date();
        const next7Days = new Date(today.setDate(today.getDate() + 7));
        this.upcomingSubscriptions = data.filter((sub) => {
          const dueDate = new Date(sub.next_due_date);
          return dueDate <= next7Days;
        });
      },
      error: (err) => {
        this.errorMessage = 'Failed to load dashboard data.';
        console.error('Error:', err);
      },
    });
  }

  connectBankAccount(): void {
    this.plaidService.getLinkToken().subscribe({
      next: (response) => {
        this.plaidService.initializePlaidLink(response.link_token, (publicToken) => {
          this.plaidService.exchangePublicToken(publicToken).subscribe({
            next: (res) => {
              const accessToken = res.access_token;
              console.log('Bank connected successfully');
              
              // Store the access token locally for future use
              localStorage.setItem('plaid_access_token', accessToken);
              
              // Fetch transactions to display them
              this.plaidService.getTransactions(accessToken).subscribe({
                next: (transactions: any[]) => {
                  console.log(`Found ${transactions.length} transactions`);
                  this.processTransactions(transactions);
                },
                error: (err: any) => console.error('Transaction Fetch Error:', err),
              });
            },
            error: (err) => console.error('Exchange Token Error:', err),
          });
        });
      },
      error: (err) => console.error('Link Token Error:', err),
    });
  }

  private processTransactions(transactions: any[]): void {
    if (!transactions || transactions.length === 0) {
      console.log('No transactions found');
      return;
    }

    console.log(`Processing ${transactions.length} transactions`);
    
    // Group transactions by merchant name to identify recurring payments
    const potentialSubscriptions = new Map<string, any[]>();
    
    transactions.forEach(transaction => {
      const merchantName = transaction.merchant_name || transaction.name;
      if (!potentialSubscriptions.has(merchantName)) {
        potentialSubscriptions.set(merchantName, []);
      }
      // Check if the merchant exists in the map before pushing
      const merchantTransactions = potentialSubscriptions.get(merchantName);
      if (merchantTransactions) {
        merchantTransactions.push(transaction);
      }
    });
    
    // Look for merchants with multiple transactions as potential subscriptions
    potentialSubscriptions.forEach((txns, merchant) => {
      if (txns.length > 1) {
        console.log(`Potential subscription: ${merchant} with ${txns.length} transactions`);
        
        // You could calculate average price and frequency here
        const avgAmount = txns.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) / txns.length;
        
        // Create a suggested subscription
        const suggestedSubscription = {
          name: merchant,
          price: avgAmount.toFixed(2),
          billing_cycle: 'monthly', // Default assumption
          category: 'Other', // Default category
          next_due_date: this.estimateNextDueDate(txns)
        };
        
        console.log('Suggested subscription:', suggestedSubscription);
        // You could display these to the user for confirmation before adding
      }
    });
  }

  private estimateNextDueDate(transactions: any[]): string {
    // Sort transactions by date, newest first
    const sortedTxns = [...transactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    if (sortedTxns.length >= 2) {
      const mostRecent = new Date(sortedTxns[0].date);
      const secondMostRecent = new Date(sortedTxns[1].date);
      
      // Calculate the difference in days
      const diffTime = Math.abs(mostRecent.getTime() - secondMostRecent.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Add the same number of days to estimate next due date
      const nextDueDate = new Date(mostRecent);
      nextDueDate.setDate(nextDueDate.getDate() + diffDays);
      
      return nextDueDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }
    
    // If we can't determine a pattern, default to one month from today
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
    return oneMonthFromNow.toISOString().split('T')[0];
  }
}