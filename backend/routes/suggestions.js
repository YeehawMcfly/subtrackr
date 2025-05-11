const express = require('express');
const router = express.Router();
const db = require('../db');
const moment = require('moment');

// Get subscription suggestions for a user
router.get('/:userId', (req, res) => {
  const userId = req.params.userId;
  
  db.query(
    'SELECT * FROM subscription_suggestions WHERE user_id = ? AND status = "pending" ORDER BY avg_amount DESC',
    [userId],
    (err, results) => {
      if (err) {
        console.error('Error fetching suggestions:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json(results);
    }
  );
});

// Accept a suggestion
router.post('/accept/:id', (req, res) => {
  const suggestionId = req.params.id;
  const { name, category, price, billing_cycle } = req.body;
  
  db.query(
    'SELECT * FROM subscription_suggestions WHERE id = ?',
    [suggestionId],
    (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).json({ error: 'Suggestion not found' });
      }
      
      const suggestion = results[0];
      const userId = suggestion.user_id;
      
      // Calculate next due date based on frequency and last transaction
      const nextDueDate = moment(suggestion.last_date)
        .add(billing_cycle === 'monthly' ? 1 : 12, 'months')
        .format('YYYY-MM-DD');
      
      // Create subscription
      db.query(
        'INSERT INTO subscriptions (name, category, price, billing_cycle, next_due_date, user_id) VALUES (?, ?, ?, ?, ?, ?)',
        [name || suggestion.merchant_name, category, price || suggestion.avg_amount, billing_cycle, nextDueDate, userId],
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
                message: 'Subscription created from suggestion',
                subscription_id: result.insertId
              });
            }
          );
        }
      );
    }
  );
});

// Reject a suggestion
router.post('/reject/:id', (req, res) => {
  const suggestionId = req.params.id;
  
  db.query(
    'UPDATE subscription_suggestions SET status = "rejected" WHERE id = ?',
    [suggestionId],
    (err, result) => {
      if (err) {
        console.error('Error rejecting suggestion:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({ message: 'Suggestion rejected' });
    }
  );
});

module.exports = router;