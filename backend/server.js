const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./db-init'); // Initialize the default user

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/usage-logs', require('./routes/usage-logs'));
app.use('/api/plaid', require('./routes/plaid'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));