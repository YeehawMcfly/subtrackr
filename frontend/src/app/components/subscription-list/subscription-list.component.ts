import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SubscriptionService } from '../../services/subscription.service';
import { Subscription } from '../../models/subscription.model';

@Component({
  selector: 'app-subscription-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './subscription-list.component.html',
  styleUrls: ['./subscription-list.component.css'],
})
export class SubscriptionListComponent implements OnInit {
  subscriptions: Subscription[] = [];
  errorMessage: string | null = null;
  displayedColumns: string[] = ['name', 'category', 'price', 'billing_cycle', 'next_due_date', 'actions'];

  constructor(private subscriptionService: SubscriptionService, private router: Router) {}

  ngOnInit(): void {
    this.subscriptionService.getSubscriptions().subscribe({
      next: (data) => {
        this.subscriptions = data;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load subscriptions.';
        console.error('Error:', err);
      },
    });
  }

  editSubscription(id: number): void {
    this.router.navigate([`/subscriptions/edit/${id}`]);
  }

  deleteSubscription(id: number): void {
    if (confirm('Are you sure you want to delete this subscription?')) {
      this.subscriptionService.deleteSubscription(id).subscribe({
        next: () => {
          this.subscriptions = this.subscriptions.filter((sub) => sub.sub_id !== id);
        },
        error: (err) => console.error('Error:', err),
      });
    }
  }
}