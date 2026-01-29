-- ===========================================
-- SUPABASE/POSTGRESQL SCHEMA FOR FOUNDATION WEB
-- Foundation of Christ Ministries
-- ===========================================
-- Run this in Supabase SQL Editor to create all tables

-- Enable UUID extension (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- 1. USERS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    userName VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(32) DEFAULT 'member' CHECK (role IN ('member', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ===========================================
-- 2. CONTACT MESSAGES TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS contact (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contact_email ON contact(email);
CREATE INDEX IF NOT EXISTS idx_contact_created_at ON contact(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_is_read ON contact(is_read);

-- ===========================================
-- 3. EVENTS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    additionalInfo TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('service', 'bible-study', 'youth', 'prayer', 'community', 'special')),
    date DATE NOT NULL,
    time VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    image VARCHAR(500),
    attendees INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);

-- ===========================================
-- 4. EVENT RSVPS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS event_rsvps (
    id SERIAL PRIMARY KEY,
    eventId INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    userName VARCHAR(255),
    rsvp_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(eventId, email)
);

CREATE INDEX IF NOT EXISTS idx_rsvps_eventid ON event_rsvps(eventId);
CREATE INDEX IF NOT EXISTS idx_rsvps_email ON event_rsvps(email);

-- ===========================================
-- 5. ANNOUNCEMENTS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'general' CHECK (priority IN ('important', 'info', 'general')),
    author VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_announcements_date ON announcements(date);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority);

-- ===========================================
-- 6. OFFERINGS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS offerings (
    id SERIAL PRIMARY KEY,
    member_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    amount DECIMAL(10, 2) NOT NULL,
    offering_type VARCHAR(30) NOT NULL DEFAULT 'offering' CHECK (offering_type IN ('tithe', 'offering', 'donation', 'special', 'building_fund', 'missions')),
    payment_method VARCHAR(30) NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'check', 'card', 'bank_transfer', 'mobile_money', 'online')),
    reference_number VARCHAR(100),
    date DATE NOT NULL,
    notes TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_offerings_date ON offerings(date);
CREATE INDEX IF NOT EXISTS idx_offerings_type ON offerings(offering_type);
CREATE INDEX IF NOT EXISTS idx_offerings_email ON offerings(email);

-- ===========================================
-- 7. PRAYER REQUESTS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS prayer_requests (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    request TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_read BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'praying', 'answered')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_prayer_user_email ON prayer_requests(user_email);
CREATE INDEX IF NOT EXISTS idx_prayer_created_at ON prayer_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_prayer_status ON prayer_requests(status);
CREATE INDEX IF NOT EXISTS idx_prayer_is_read ON prayer_requests(is_read);

-- ===========================================
-- 8. RESOURCES TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(30) DEFAULT 'bible_verse' CHECK (category IN ('bible_verse', 'teaching', 'devotional', 'sermon_notes', 'testimony', 'announcement', 'other')),
    scripture_reference VARCHAR(255),
    content TEXT NOT NULL,
    author VARCHAR(255),
    date_shared DATE,
    tags VARCHAR(500),
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_featured ON resources(is_featured);

-- ===========================================
-- 9. SERMONS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS sermons (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    preacher VARCHAR(255) NOT NULL,
    description TEXT,
    scripture_reference VARCHAR(255),
    date DATE NOT NULL,
    time TIME NOT NULL,
    day_type VARCHAR(20) DEFAULT 'sunday' CHECK (day_type IN ('sunday', 'weekday', 'wednesday', 'friday', 'special')),
    series_name VARCHAR(255),
    video_url VARCHAR(500),
    audio_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sermons_date ON sermons(date);
CREATE INDEX IF NOT EXISTS idx_sermons_day_type ON sermons(day_type);
CREATE INDEX IF NOT EXISTS idx_sermons_preacher ON sermons(preacher);

-- ===========================================
-- TRIGGER FOR updated_at COLUMNS
-- ===========================================
-- Create a function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offerings_updated_at BEFORE UPDATE ON offerings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prayer_requests_updated_at BEFORE UPDATE ON prayer_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sermons_updated_at BEFORE UPDATE ON sermons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- SAMPLE DATA (OPTIONAL)
-- ===========================================

-- Insert Admin User (password: admin123 - hashed with bcrypt)
-- IMPORTANT: Change this password after first login!
INSERT INTO users (userName, email, phone, password, role) 
VALUES (
    'Admin User', 
    'admin@focm.com', 
    '555-0100',
    '$2a$10$rOzJw5K5EHVJxH7YxXxCaO9rL4Z8.2vQN6FJPxYxGBE2wQJ5xGxK2',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Sample Events
INSERT INTO events (title, description, additionalInfo, category, date, time, location, attendees) VALUES
('Sunday Worship Service', 'Join us for our weekly Sunday worship service. Experience powerful praise and worship, inspiring messages, and fellowship with believers.', 'Dress code: Smart casual. Children''s ministry available.', 'service', CURRENT_DATE + INTERVAL '7 days', '9:00 AM - 11:30 AM', 'Main Sanctuary', 12),
('Midweek Bible Study', 'Deepen your understanding of God''s Word in our interactive Bible study sessions.', 'Please bring your Bible and notebook.', 'bible-study', CURRENT_DATE + INTERVAL '3 days', '6:00 PM - 8:00 PM', 'Fellowship Hall', 8),
('Youth Night', 'An evening of fun, games, and fellowship for teens and young adults.', 'Ages 13-25. Registration required.', 'youth', CURRENT_DATE + INTERVAL '5 days', '7:00 PM - 9:30 PM', 'Youth Center', 15),
('Prayer Meeting', 'Join us for a special time of corporate prayer.', 'Fasting encouraged.', 'prayer', CURRENT_DATE + INTERVAL '2 days', '6:00 AM - 7:00 AM', 'Prayer Room', 5);

-- Sample Announcements
INSERT INTO announcements (title, content, priority, author, date) VALUES
('Welcome to Our New Website!', 'We are excited to launch our new church website. Explore events, sermons, and resources all in one place.', 'important', 'Church Administrator', CURRENT_DATE),
('Volunteer Opportunities', 'We are looking for volunteers to serve in various ministries. Contact the church office if interested.', 'info', 'Volunteer Coordinator', CURRENT_DATE),
('Weekly Prayer Focus', 'This week we are praying for our youth and young adults. Join us in lifting them up in prayer.', 'general', 'Prayer Team', CURRENT_DATE);

-- Sample Resources
INSERT INTO resources (title, category, scripture_reference, content, author, date_shared, tags, is_featured) VALUES
('Trust in the Lord', 'bible_verse', 'Proverbs 3:5-6', 'Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.', 'Pastor John', CURRENT_DATE, 'trust,faith,guidance', TRUE),
('The Lord is My Shepherd', 'bible_verse', 'Psalm 23:1-3', 'The LORD is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.', 'Pastor John', CURRENT_DATE, 'peace,provision,comfort', TRUE),
('Love One Another', 'teaching', 'John 13:34-35', 'A new command I give you: Love one another. As I have loved you, so you must love one another. By this everyone will know that you are my disciples, if you love one another.', 'Pastor Mary', CURRENT_DATE, 'love,discipleship,community', FALSE);

-- ===========================================
-- ROW LEVEL SECURITY (RLS) - OPTIONAL
-- Uncomment if you want to enable RLS
-- ===========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- VERIFICATION QUERIES
-- ===========================================
-- Run these after creating tables to verify:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT * FROM users WHERE role = 'admin';
