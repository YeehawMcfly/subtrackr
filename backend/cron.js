const cron = require('node-cron');
const db = require('./db');

// Run every day at 8 AM
cron.schedule('0 8 * * *', () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  db.query(
    'SELECT * FROM subscriptions WHERE next_due_date = ?',
    [tomorrowStr],
    (err, results) => {
      if (err) {
        console.error('Error checking due dates:', err);
        return;
      }
      results.forEach((sub) => {
        console.log(`Reminder: ${sub.name} is due tomorrow (${sub.next_due_date}).`);
        // TODO: Add email notification with nodemailer
      });
    }
  );
});

// Check for inactive subscriptions (no usage logs for 30 days)
cron.schedule('0 0 * * *', () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().slice(0, 10);

  db.query(
    `
    SELECT s.sub_id, s.name 
    FROM subscriptions s
    LEFT JOIN usage_logs ul ON s.sub_id = ul.sub_id 
    WHERE ul.usage_date IS NULL OR ul.usage_date < ?
    GROUP BY s.sub_id
    `,
    [thirtyDaysAgoStr],
    (err, results) => {
      if (err) {
        console.error('Error checking inactive subscriptions:', err);
        return;
      }
      results.forEach((sub) => {
        console.log(`Inactive: ${sub.name} has no usage logs in the last 30 days.`);
        // TODO: Update subscription status or notify user
      });
    }
  );
});