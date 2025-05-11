const express = require('express');
const router = express.Router();
const plaidClient = require('../plaid');
const moment = require('moment');
const db = require('../db');

// Create a link token for Plaid Link
router.post('/create_link_token', async (req, res) => {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: 'default-user' },
      client_name: 'SubTrackr',
      products: ['transactions'],
      country_codes: ['US'],
      language: 'en',
    });
    res.json({ link_token: response.data.link_token });
  } catch (err) {
    console.error('Error creating link token:', err.response ? err.response.data : err.message);
    res.status(500).json({ error: 'Plaid error creating link token' });
  }
});

// Exchange public token for access token
router.post('/exchange_public_token', async (req, res) => {
  try {
    const { public_token } = req.body;
    
    // Exchange the public token for an access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: public_token,
    });
    
    const access_token = exchangeResponse.data.access_token;
    const item_id = exchangeResponse.data.item_id;
    
    // Get institution details
    let institutionName = 'Connected Bank';
    try {
      const itemResponse = await plaidClient.itemGet({
        access_token: access_token,
      });
      
      const institutionId = itemResponse.data.item.institution_id;
      
      if (institutionId) {
        const instResponse = await plaidClient.institutionsGetById({
          institution_id: institutionId,
          country_codes: ['US'],
        });
        institutionName = instResponse.data.institution.name;
      }
    } catch (err) {
      console.error('Error fetching institution name:', err);
    }
    
    // Store bank connection in database
    db.query(
      'INSERT INTO connected_banks (name, connected_at) VALUES (?, NOW())',
      [institutionName],
      (err, result) => {
        if (err) {
          console.error('Error storing bank connection:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        // Store access token securely (in production, encrypt this)
        db.query(
          'INSERT INTO plaid_items (access_token, item_id) VALUES (?, ?)',
          [access_token, item_id],
          (err) => {
            if (err) {
              console.error('Error storing access token:', err);
            }
            
            // In production, don't return the actual access token
            res.json({ 
              success: true,
              item_id: item_id
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Error in token exchange:', error);
    res.status(500).json({ error: 'Failed to process the request' });
  }
});

// Get transactions from Plaid
router.post('/transactions', async (req, res) => {
  try {
    // Get the access token - in production you would retrieve this from your database
    // based on the user or request
    let access_token;
    if (req.body.access_token) {
      // If client provided token (not recommended for production)
      access_token = req.body.access_token;
    } else {
      // Get the most recent access token from database
      const tokenResult = await new Promise((resolve, reject) => {
        db.query('SELECT access_token FROM plaid_items ORDER BY id DESC LIMIT 1', (err, results) => {
          if (err || results.length === 0) reject(err || new Error('No access token found'));
          else resolve(results[0].access_token);
        });
      });
      access_token = tokenResult;
    }
    
    // Get transactions from the last 30 days
    const startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
    const endDate = moment().format('YYYY-MM-DD');
    
    const transactionsResponse = await plaidClient.transactionsGet({
      access_token: access_token,
      start_date: startDate,
      end_date: endDate,
    });
    
    const transactions = transactionsResponse.data.transactions;
    
    // Process transactions to find recurring payments (potential subscriptions)
    processTransactions(transactions);
    
    // Return the transactions to the client
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Process transactions to find recurring patterns
function processTransactions(transactions) {
  if (!transactions || transactions.length === 0) return;
  
  const merchantCounts = {};
  const merchantAmounts = {};
  
  transactions.forEach(tx => {
    const merchant = tx.merchant_name;
    if (!merchant) return;
    
    if (!merchantCounts[merchant]) {
      merchantCounts[merchant] = 0;
      merchantAmounts[merchant] = 0;
    }
    merchantCounts[merchant]++;
    merchantAmounts[merchant] += Math.abs(tx.amount);
  });
  
  // Find potential subscriptions (merchants with multiple transactions)
  Object.keys(merchantCounts).forEach(merchant => {
    if (merchantCounts[merchant] >= 2) {
      const avgAmount = merchantAmounts[merchant] / merchantCounts[merchant];
      
      // Store as suggestion in database
      db.query(
        `INSERT IGNORE INTO subscription_suggestions 
         (merchant_name, avg_amount, detected_at) 
         VALUES (?, ?, NOW())`,
        [merchant, avgAmount],
        (err) => {
          if (err) console.error('Error storing suggestion:', err);
        }
      );
    }
  });
}

// Get subscription suggestions
router.get('/subscription-suggestions', (req, res) => {
  db.query(
    'SELECT * FROM subscription_suggestions ORDER BY detected_at DESC',
    (err, results) => {
      if (err) {
        console.error('Error fetching suggestions:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json(results);
    }
  );
});

// Accept a suggestion and create a subscription
router.post('/accept-suggestion', (req, res) => {
  const { suggestionId, name, price, category, billing_cycle } = req.body;
  
  // First get the suggestion
  db.query(
    'SELECT * FROM subscription_suggestions WHERE id = ?',
    [suggestionId],
    (err, suggestions) => {
      if (err || suggestions.length === 0) {
        return res.status(404).json({ error: 'Suggestion not found' });
      }
      
      const suggestion = suggestions[0];
      
      // Calculate next due date based on billing cycle
      const nextDueDate = moment()
        .add(billing_cycle === 'monthly' ? 1 : 12, 'months')
        .format('YYYY-MM-DD');
      
      // Create subscription
      db.query(
        `INSERT INTO subscriptions 
         (name, category, price, billing_cycle, next_due_date) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          name || suggestion.merchant_name, 
          category || 'Other', 
          price || suggestion.avg_amount, 
          billing_cycle || 'monthly', 
          nextDueDate
        ],
        (err, result) => {
          if (err) {
            console.error('Error creating subscription:', err);
            return res.status(500).json({ error: 'Failed to create subscription' });
          }
          
          // Update suggestion status
          db.query(
            'UPDATE subscription_suggestions SET status = "approved" WHERE id = ?',
            [suggestionId],
            (err) => {
              if (err) {
                console.error('Error updating suggestion status:', err);
              }
              
              res.status(201).json({ 
                message: 'Subscription created successfully',
                subscription_id: result.insertId 
              });
            }
          );
        }
      );
    }
  );
});

// Get connected banks
router.get('/connected-banks', (req, res) => {
  db.query(
    'SELECT * FROM connected_banks ORDER BY connected_at DESC',
    (err, results) => {
      if (err) {
        console.error('Error fetching connected banks:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json(results);
    }
  );
});

module.exports = router;