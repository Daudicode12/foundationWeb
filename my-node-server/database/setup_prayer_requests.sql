-- Create prayer requests table
CREATE TABLE IF NOT EXISTS prayer_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  user_name VARCHAR(100) NOT NULL,
  user_email VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  request TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_read BOOLEAN DEFAULT FALSE,
  status ENUM('pending', 'praying', 'answered') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Add indexes for faster queries
CREATE INDEX idx_prayer_user_email ON prayer_requests(user_email);
CREATE INDEX idx_prayer_created_at ON prayer_requests(created_at);
CREATE INDEX idx_prayer_status ON prayer_requests(status);
CREATE INDEX idx_prayer_is_read ON prayer_requests(is_read);
