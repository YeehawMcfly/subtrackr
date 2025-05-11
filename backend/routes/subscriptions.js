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

module.exports = router;