CREATE DATABASE subtrackr;
USE subtrackr;

-- Create the users table first since other tables reference it
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Simplified subscriptions table
CREATE TABLE subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) DEFAULT 'Other',
  price DECIMAL(6,2) NOT NULL,
  billing_cycle ENUM('monthly', 'yearly') NOT NULL,
  next_due_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Simplified payment tracking
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subscription_id INT NOT NULL,
  amount_paid DECIMAL(6,2) NOT NULL,
  payment_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

-- Create usage logs table
CREATE TABLE usage_logs (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  sub_id INT NOT NULL,
  usage_date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sub_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

-- Track bank connections for UI purposes
CREATE TABLE connected_banks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Store subscription suggestions from transaction analysis
CREATE TABLE subscription_suggestions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  merchant_name VARCHAR(100) NOT NULL,
  avg_amount DECIMAL(6,2) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY (merchant_name)
);

-- Store Plaid access tokens securely
CREATE TABLE plaid_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  access_token VARCHAR(255) NOT NULL,
  item_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a default user for existing data
INSERT INTO users (email, password, name) 
VALUES ('default@example.com', 'temporarypassword', 'Default User');

-- Insert initial subscription data
INSERT INTO subscriptions (name, category, price, billing_cycle, next_due_date) 
VALUES 
('Netflix', 'streaming', 15.99, 'monthly', '2025-06-01'),
('Spotify', 'streaming', 9.99, 'monthly', '2025-05-20'),
('iCloud', 'productivity', 2.99, 'monthly', '2025-05-15');