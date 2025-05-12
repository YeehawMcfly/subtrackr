const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all subscriptions
router.get('/', (req, res) => {
  db.query('SELECT * FROM subscriptions', (err, results) => {
    if (err) {
      console.error('Error fetching subscriptions:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Add the debug route BEFORE the :id route
router.get('/debug/all', (req, res) => {
  db.query('SHOW TABLES', (err, tables) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err.message });
    
    db.query('DESCRIBE subscriptions', (err, structure) => {
      if (err) return res.status(500).json({ error: 'Table error', details: err.message });
      
      db.query('SELECT * FROM subscriptions', (err, data) => {
        if (err) return res.status(500).json({ error: 'Query error', details: err.message });
        
        res.json({
          tables: tables,
          structure: structure,
          data: data
        });
      });
    });
  });
});

// Get a specific subscription by ID
router.get('/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM subscriptions WHERE sub_id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching subscription:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    // If the 'results' array is empty, it means no subscription was found with that sub_id
    if (results.length === 0) {
      // This line is sending the 404 Not Found response
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.json(results[0]);
  });
});

// Create a new subscription
router.post('/', (req, res) => {
  const { name, category, price, billing_cycle, next_due_date } = req.body;
  
  db.query(
    'INSERT INTO subscriptions (name, category, price, billing_cycle, next_due_date) VALUES (?, ?, ?, ?, ?)',
    [name, category, price, billing_cycle, next_due_date],
    (err, result) => {
      if (err) {
        console.error('Error creating subscription:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      const newSubscription = {
        sub_id: result.insertId,
        name,
        category,
        price, 
        billing_cycle,
        next_due_date,
        created_at: new Date()
      };
      
      res.status(201).json(newSubscription);
    }
  );
});

// Update a subscription
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { name, category, price, billing_cycle, next_due_date } = req.body;
  
  db.query(
    'UPDATE subscriptions SET name = ?, category = ?, price = ?, billing_cycle = ?, next_due_date = ? WHERE sub_id = ?',
    [name, category, price, billing_cycle, next_due_date, id],
    (err, result) => {
      if (err) {
        console.error('Error updating subscription:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Subscription not found' });
      }
      
      const updatedSubscription = {
        sub_id: parseInt(id),
        name,
        category,
        price,
        billing_cycle,
        next_due_date,
        updated_at: new Date()
      };
      
      res.json(updatedSubscription);
    }
  );
});

// Delete a subscription
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  
  db.query('DELETE FROM subscriptions WHERE sub_id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting subscription:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    res.json({ message: 'Subscription deleted successfully' });
  });
});

module.exports = router;