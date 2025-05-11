const db = require('./db');

// Ensure the default user exists
function initializeDefaultUser() {
  db.query(
    'SELECT * FROM users WHERE id = 1',
    (err, results) => {
      if (err) {
        console.error('Error checking for default user:', err);
        return;
      }
      
      if (results.length === 0) {
        // Create the default user if it doesn't exist
        db.query(
          'INSERT INTO users (id, email, password, name) VALUES (1, "default@example.com", "defaultpassword", "Default User")',
          (err) => {
            if (err) {
              console.error('Error creating default user:', err);
              return;
            }
            console.log('Default user created successfully');
          }
        );
      } else {
        console.log('Default user already exists');
      }
    }
  );
}

initializeDefaultUser();

module.exports = { initializeDefaultUser };