-- Sermons Table Setup
-- Run this SQL to create the sermons table in your database

CREATE TABLE IF NOT EXISTS sermons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    preacher VARCHAR(255) NOT NULL,
    description TEXT,
    scripture_reference VARCHAR(255),
    date DATE NOT NULL,
    time TIME NOT NULL,
    day_type ENUM('sunday', 'weekday', 'wednesday', 'friday', 'special') DEFAULT 'sunday',
    series_name VARCHAR(255),
    video_url VARCHAR(500),
    audio_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_sermons_date ON sermons(date);
CREATE INDEX idx_sermons_day_type ON sermons(day_type);
CREATE INDEX idx_sermons_preacher ON sermons(preacher);

-- Example data (optional)
-- INSERT INTO sermons (title, preacher, description, scripture_reference, date, time, day_type, series_name)
-- VALUES 
-- ('Walking in Faith', 'Pastor John', 'A powerful message about trusting God in difficult times', 'Hebrews 11:1-6', '2026-01-12', '10:00:00', 'sunday', 'Faith Series'),
-- ('Midweek Prayer', 'Elder Mary', 'Exploring the power of corporate prayer', 'Matthew 18:19-20', '2026-01-08', '18:30:00', 'wednesday', NULL),
-- ('The Joy of the Lord', 'Pastor John', 'Finding joy in every circumstance', 'Nehemiah 8:10', '2026-01-10', '19:00:00', 'friday', 'Joy Series');
