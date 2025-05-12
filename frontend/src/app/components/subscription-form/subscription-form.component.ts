import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SubscriptionService } from '../../services/subscription.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { Subscription } from '../../models/subscription.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-subscription-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    RouterLink,
    MatProgressSpinnerModule,
  ],
  templateUrl: './subscription-form.component.html',
  styleUrls: ['./subscription-form.component.css'],
})
export class SubscriptionFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  subId: number | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private subscriptionService: SubscriptionService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialize the form with the required controls and validators
    this.initForm();
    
    // Check route params and fetch subscription details if in edit mode
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.subId = +params['id'];
        this.loadSubscription();
      }
    });
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      billing_cycle: ['monthly', Validators.required],
      next_due_date: ['', Validators.required]
    });
  }

  private loadSubscription(): void {
    this.loading = true;
    this.error = null;
    
    this.subscriptionService.getSubscription(this.subId!)
      .pipe(
        catchError(err => {
          console.error('Error loading subscription:', err);
          this.error = 'Failed to load subscription details. The subscription may have been deleted or the server is not responding.';
          this.loading = false;
          return of(null);
        })
      )
      .subscribe(sub => {
        if (sub) {
          // Format the date properly for the input control
          if (sub.next_due_date) {
            const date = new Date(sub.next_due_date);
            const formattedDate = date.toISOString().split('T')[0];
            sub.next_due_date = formattedDate;
          }
          
          this.form.patchValue(sub);
        }
        this.loading = false;
      });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const subscription: Subscription = this.form.value;
    
    this.loading = true;
    this.error = null;
    
    if (this.isEditMode && this.subId) {
      this.subscriptionService.updateSubscription(this.subId, subscription)
        .pipe(
          catchError(err => {
            console.error('Error updating subscription:', err);
            this.error = 'Failed to update subscription. Please try again later.';
            this.loading = false;
            return of(null);
          })
        )
        .subscribe(result => {
          if (result !== null) {
            this.router.navigate(['/subscriptions']);
          }
          this.loading = false;
        });
    } else {
      this.subscriptionService.addSubscription(subscription)
        .pipe(
          catchError(err => {
            console.error('Error adding subscription:', err);
            this.error = 'Failed to add subscription. Please try again later.';
            this.loading = false;
            return of(null);
          })
        )
        .subscribe(result => {
          if (result !== null) {
            this.router.navigate(['/subscriptions']);
          }
          this.loading = false;
        });
    }
  }
}