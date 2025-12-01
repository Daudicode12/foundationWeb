-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    additionalInfo TEXT,
    category ENUM('service', 'bible-study', 'youth', 'prayer', 'community', 'special') NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    image VARCHAR(500),
    attendees INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create event_rsvps table
CREATE TABLE IF NOT EXISTS event_rsvps (
    id INT PRIMARY KEY AUTO_INCREMENT,
    eventId INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    userName VARCHAR(255),
    rsvp_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE,
    UNIQUE KEY unique_rsvp (eventId, email)
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority ENUM('important', 'info', 'general') DEFAULT 'general',
    author VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample events
INSERT INTO events (title, description, additionalInfo, category, date, time, location, image, attendees) VALUES
('Sunday Worship Service', 'Join us for our weekly Sunday worship service. Experience powerful praise and worship, inspiring messages, and fellowship with believers.', 'Dress code: Smart casual. Children\'s ministry available.', 'service', '2024-11-10', '9:00 AM - 11:30 AM', 'Main Sanctuary', NULL, 12),
('Midweek Bible Study', 'Deepen your understanding of God\'s Word in our interactive Bible study sessions. This week we\'ll be studying the Book of Romans.', 'Please bring your Bible and notebook.', 'bible-study', '2024-11-08', '6:00 PM - 8:00 PM', 'Fellowship Hall', NULL, 8),
('Youth Night: Game Night', 'An evening of fun, games, and fellowship for teens and young adults. Pizza and refreshments will be provided!', 'Ages 13-25. Registration required.', 'youth', '2024-11-12', '7:00 PM - 9:30 PM', 'Youth Center', NULL, 15),
('Prayer and Fasting', 'Join us for a special time of corporate prayer and fasting. Let\'s seek God\'s face together for breakthrough and revival.', 'Fasting from 6 AM to 6 PM. Prayer sessions throughout the day.', 'prayer', '2024-11-15', '6:00 AM - 6:00 PM', 'Prayer Room', NULL, 5),
('Community Outreach', 'Serving our community with love! We\'ll be distributing food packages and sharing the gospel in the neighborhood.', 'Volunteers needed. Meet at church for transportation.', 'community', '2024-11-18', '10:00 AM - 2:00 PM', 'Community Center', NULL, 20),
('Christmas Concert', 'Celebrate the season with our annual Christmas concert featuring the church choir, orchestra, and special guest performers.', 'Tickets available at the church office. Free admission for members.', 'special', '2024-12-20', '6:00 PM - 8:00 PM', 'Main Sanctuary', NULL, 0),
('Marriage Enrichment Seminar', 'Strengthen your marriage with practical biblical principles. For married couples and engaged couples planning to marry.', 'Registration fee: $50 per couple. Includes materials and lunch.', 'special', '2024-11-25', '9:00 AM - 4:00 PM', 'Conference Room', NULL, 3),
('Youth Leadership Training', 'Equipping the next generation of leaders! A day of training, mentorship, and practical skills development for youth leaders.', 'Ages 16-30. Registration required.', 'youth', '2024-11-22', '10:00 AM - 3:00 PM', 'Youth Center', NULL, 7);

-- Insert sample announcements
INSERT INTO announcements (title, content, priority, author, date) VALUES
('Church Office Closed', 'Please note that the church office will be closed on November 11th in observance of Veterans Day. Regular office hours will resume on November 12th. For emergencies, please contact Pastor John at 555-0123.', 'important', 'Church Administrator', '2024-11-04'),
('New Small Group Starting', 'Exciting news! A new small group focused on young professionals is starting this month. The group will meet every Thursday at 7 PM at the Johnsons\' home. Contact Sarah at sarah@example.com to join.', 'info', 'Small Groups Coordinator', '2024-11-03'),
('Volunteer Opportunities', 'We are looking for volunteers to serve in various ministries: Children\'s Ministry, Ushering Team, Hospitality, and Media Team. If you\'re interested in serving, please fill out the volunteer form at the welcome desk or contact the church office.', 'general', 'Volunteer Coordinator', '2024-11-02'),
('Thanksgiving Food Drive', 'Our annual Thanksgiving food drive is underway! We are collecting non-perishable food items to bless families in need this holiday season. Drop off your donations at the church lobby. Collection ends November 20th.', 'important', 'Outreach Ministry', '2024-11-01'),
('Baptism Class', 'Are you ready to take the next step in your faith journey? Join our baptism class on November 19th at 2 PM. The class will cover the meaning of baptism and prepare you for the baptism service on November 26th. Sign up at the welcome desk.', 'info', 'Pastor John', '2024-11-01'),
('Church App Now Available', 'Stay connected with FOCM on the go! Download our new church app available on iOS and Android. Access sermons, events, giving, and more right from your phone. Search "FOCM Church" in your app store.', 'info', 'Media Team', '2024-10-30'),
('Budget Meeting', 'The annual church budget meeting will be held on November 30th after the Sunday service. All members are encouraged to attend. Light refreshments will be provided. Your input and feedback are valuable!', 'general', 'Finance Committee', '2024-10-28');

-- Query to check data
SELECT * FROM events ORDER BY date ASC;
SELECT * FROM announcements ORDER BY date DESC;
