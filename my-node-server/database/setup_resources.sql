-- Create resources table for storing Bible verses and church teachings
CREATE TABLE IF NOT EXISTS resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category ENUM('bible_verse', 'teaching', 'devotional', 'sermon_notes', 'testimony', 'announcement', 'other') DEFAULT 'bible_verse',
  scripture_reference VARCHAR(255),
  content TEXT NOT NULL,
  author VARCHAR(255),
  date_shared DATE,
  tags VARCHAR(500),
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add some sample resources
INSERT INTO resources (title, category, scripture_reference, content, author, date_shared, tags, is_featured) VALUES
('Trust in the Lord', 'bible_verse', 'Proverbs 3:5-6', 'Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.', 'Pastor John', CURDATE(), 'trust,faith,guidance', TRUE),
('The Lord is My Shepherd', 'bible_verse', 'Psalm 23:1-3', 'The LORD is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.', 'Pastor John', CURDATE(), 'peace,provision,comfort', TRUE),
('Love One Another', 'teaching', 'John 13:34-35', 'A new command I give you: Love one another. As I have loved you, so you must love one another. By this everyone will know that you are my disciples, if you love one another.', 'Pastor Mary', CURDATE(), 'love,discipleship,community', FALSE);
