import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common'; // Add this
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { SubscriptionService } from '../../services/subscription.service';
import { Subscription } from '../../models/subscription.model';

@Component({
  selector: 'app-subscription-form',
  standalone: true,
  imports: [
    CommonModule, // Add this
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    RouterLink,
  ],
  templateUrl: './subscription-form.component.html',
  styleUrls: ['./subscription-form.component.css'],
})
export class SubscriptionFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  subId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private subscriptionService: SubscriptionService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      billing_cycle: ['monthly', Validators.required],
      next_due_date: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.subId = +params['id'];
        this.subscriptionService.getSubscription(this.subId).subscribe({
          next: (sub) => this.form.patchValue(sub),
          error: (err) => console.error('Error:', err),
        });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const subscription: Subscription = this.form.value;
    if (this.isEditMode && this.subId) {
      this.subscriptionService.updateSubscription(this.subId, subscription).subscribe({
        next: () => this.router.navigate(['/subscriptions']),
        error: (err) => console.error('Error:', err),
      });
    } else {
      this.subscriptionService.addSubscription(subscription).subscribe({
        next: () => this.router.navigate(['/subscriptions']),
        error: (err) => console.error('Error:', err),
      });
    }
  }
}