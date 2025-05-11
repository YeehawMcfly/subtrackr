const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all payments
router.get('/', (req, res) => {
  db.query('SELECT * FROM payments', (err, results) => {
    if (err) {
      console.error('Error fetching payments:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Add a payment
router.post('/', (req, res) => {
  const { sub_id, amount_paid, payment_date } = req.body;
  const query = 'INSERT INTO payments (sub_id, amount_paid, payment_date) VALUES (?, ?, ?)';
  db.query(query, [sub_id, amount_paid, payment_date], (err, results) => {
    if (err) {
      console.error('Error adding payment:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ payment_id: results.insertId, ...req.body });
  });
});

module.exports = router;