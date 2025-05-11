import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { SubscriptionService } from '../../services/subscription.service';
import { Subscription } from '../../models/subscription.model';
import { ChartDataset, ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    BaseChartDirective,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    FormsModule,
  ],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css'],
})
export class AnalyticsComponent implements OnInit {
  chartData: ChartDataset[] = [];
  chartLabels: string[] = [];
  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // This allows the chart to respect the container's height
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };
  chartType: ChartType = 'pie';
  viewType: string = 'category';
  totalSpend: number = 0;
  errorMessage: string | null = null;

  constructor(private subscriptionService: SubscriptionService) {}

  ngOnInit(): void {
    this.updateChart();
  }

  updateChart(): void {
    this.subscriptionService.getSubscriptions().subscribe({
      next: (subs) => {
        console.log('Subscriptions fetched:', subs); // Log the raw data
        this.totalSpend = subs.reduce((sum, sub) => sum + parseFloat(sub.price), 0);
        if (this.viewType === 'category') {
          const categories: { [key: string]: number } = {};
          subs.forEach((sub) => {
            const category = sub.category.toLowerCase(); // Normalize case
            categories[category] = (categories[category] || 0) + parseFloat(sub.price); // Convert to number
          });
          console.log('Categories aggregated:', categories); // Log the aggregated data
          this.chartLabels = Object.keys(categories);
          this.chartData = [
            {
              data: Object.values(categories),
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
            },
          ];
          this.chartType = 'pie';
        } else if (this.viewType === 'month') {
          const monthly: { [key: string]: number } = {};
          const today = new Date();
          for (let i = 0; i < 12; i++) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            monthly[date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear()] = 0;
          }
          subs.forEach((sub) => {
            const dueDate = new Date(sub.next_due_date);
            const monthKey = dueDate.toLocaleString('default', { month: 'short' }) + ' ' + dueDate.getFullYear(); // Fix typo: date -> dueDate
            monthly[monthKey] = (monthly[monthKey] || 0) + parseFloat(sub.price); // Convert to number
          });
          this.chartLabels = Object.keys(monthly).reverse();
          this.chartData = [
            {
              data: Object.values(monthly).reverse(),
              backgroundColor: '#36A2EB',
            },
          ];
          this.chartType = 'bar';
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to load analytics.';
        console.error('Error:', err);
      },
    });
  }
}