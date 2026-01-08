-- Create offerings table
CREATE TABLE IF NOT EXISTS offerings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  offering_type ENUM('tithe', 'offering', 'donation', 'special', 'building_fund', 'missions') DEFAULT 'offering',
  payment_method ENUM('cash', 'check', 'card', 'mobile_money', 'bank_transfer', 'online') DEFAULT 'cash',
  reference_number VARCHAR(100),
  date DATE NOT NULL,
  notes TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_offerings_date ON offerings(date);
CREATE INDEX idx_offerings_type ON offerings(offering_type);
CREATE INDEX idx_offerings_email ON offerings(email);

-- Sample data (optional - remove in production)
-- INSERT INTO offerings (member_name, email, amount, offering_type, payment_method, date, notes) VALUES
-- ('John Doe', 'john@example.com', 100.00, 'tithe', 'cash', CURDATE(), 'Sunday service'),
-- ('Jane Smith', 'jane@example.com', 50.00, 'offering', 'mobile_money', CURDATE(), 'Weekly offering');
