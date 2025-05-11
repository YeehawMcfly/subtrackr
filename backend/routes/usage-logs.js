const express = require('express');
const router = express.Router();
const db = require('../db');

// Get usage logs for a subscription
router.get('/:subId/usage-logs', (req, res) => {
  const { subId } = req.params;
  db.query('SELECT * FROM usage_logs WHERE sub_id = ?', [subId], (err, results) => {
    if (err) {
      console.error('Error fetching usage logs:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Add a usage log
router.post('/', (req, res) => {
  const { sub_id, usage_date, note } = req.body;
  const query = 'INSERT INTO usage_logs (sub_id, usage_date, note) VALUES (?, ?, ?)';
  db.query(query, [sub_id, usage_date, note], (err, results) => {
    if (err) {
      console.error('Error adding usage log:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ log_id: results.insertId, ...req.body });
  });
});

module.exports = router;