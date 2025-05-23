# SubTrackr

![SubTrackr Logo](frontend/public/favicon.ico)

## Overview

SubTrackr is a subscription tracking application designed to help users manage and optimize their recurring expenses. With the increasing number of subscription services in our daily lives, SubTrackr provides a centralized platform to monitor costs, track usage, and receive timely reminders.

## Features

- **Dashboard**: Get a quick overview of your subscription expenses and upcoming payments
- **Subscription Management**: Add, edit, and delete subscription services
- **Financial Analytics**: Visualize your spending by category or month
- **Bank Integration**: Connect your bank account via Plaid for automatic subscription detection
- **Usage Logging**: Track how often you use your subscriptions to identify underutilized services
- **Payment History**: Keep records of past payments and predict future expenses

## Tech Stack

### Frontend
- **Framework**: Angular 19
- **UI Components**: Angular Material
- **Charts**: ng2-charts with Chart.js
- **HTTP Client**: Angular HttpClient
- **Styling**: Custom CSS with Angular Material theming

### Backend
- **Server**: Node.js with Express
- **Database**: MySQL with MySQL Workbench
- **Financial Data**: Plaid API (Sandbox environment)
- **Scheduling**: node-cron for automated tasks

## Project Status

### Development Note

This project is currently in **development/prototype stage** and is primarily a learning exercise. Key limitations include:

- **No Authentication**: The application currently has no user authentication system or account management
- **Plaid Implementation**: The Plaid integration is implemented for sandbox use only and would require additional security and compliance work for production use
- **Limited Error Handling**: Error handling is minimal and would need enhancement for production
- **Educational Purpose**: This was created as a learning project to explore full-stack development with Angular, Node.js, and third-party API integration

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- MySQL Workbench (recommended for database management)
- Angular CLI (v19 or higher)

### Database Setup
1. Create a MySQL database using MySQL Workbench or the command line:
```sql
CREATE DATABASE subtrackr;
```

2. Run the schema script:
```bash
mysql -u yourusername -p subtrackr < db/schema.sql
```

### Backend Setup
1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```
DB_HOST=localhost
DB_USER=yourusername
DB_PASS=yourpassword
DB_NAME=subtrackr
PORT=5000
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox
```

4. Start the server:
```bash
npm start
```

### Frontend Setup
1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. The application will be available at `http://localhost:4200`

## Development

### Development Tools
- **MySQL Workbench**: Used for database design, schema creation, and data management
- **VS Code**: Recommended editor with Angular and Node.js extensions
- **Plaid Developer Dashboard**: Required for obtaining API credentials for the banking integration

### Backend API Endpoints

#### Subscriptions
- `GET /api/subscriptions` - Get all subscriptions
- `GET /api/subscriptions/:id` - Get a specific subscription
- `POST /api/subscriptions` - Create a new subscription
- `PUT /api/subscriptions/:id` - Update a subscription
- `DELETE /api/subscriptions/:id` - Delete a subscription

#### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Record a new payment

#### Usage Logs
- `GET /api/subscriptions/:id/usage-logs` - Get usage logs for a subscription
- `POST /api/usage-logs` - Add a usage log

#### Plaid Integration
- `POST /api/plaid/create_link_token` - Create a Plaid Link token
- `POST /api/plaid/exchange_public_token` - Exchange public token for access token
- `POST /api/plaid/transactions` - Fetch transactions from connected bank

### Building for Production

#### Frontend
```bash
cd frontend
npm run build
```

The production build will be available in the `frontend/dist/frontend` directory.

## Future Development Goals

Future enhancements that could be added to the project:

1. User authentication and account management
2. More robust error handling and validation
3. Email notifications for upcoming payments
4. Secure storage of financial data
5. Multi-currency support
6. Mobile app version

## Project Structure

```
subtrackr/
├── backend/                  # Node.js Express backend
│   ├── controllers/          # Business logic
│   ├── routes/               # API endpoints
│   ├── db.js                 # Database connection
│   ├── plaid.js              # Plaid API client
│   ├── server.js             # Express server setup
│   └── cron.js               # Scheduled tasks
├── db/                       # Database scripts
│   └── schema.sql            # MySQL schema created with MySQL Workbench
└── frontend/                 # Angular frontend
    ├── src/
    │   ├── app/              # Application components
    │   │   ├── components/   # UI components
    │   │   ├── models/       # Data models
    │   │   └── services/     # API services
    │   ├── environments/     # Environment configurations
    │   └── assets/           # Static assets
    └── angular.json          # Angular configuration
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
