# Events & Announcements Feature Setup Guide

## Overview
The Events & Announcements feature allows church members to:
- View upcoming church events
- See past events
- RSVP for events
- Filter events by category (Services, Bible Study, Youth, Prayer, Community, Special Events)
- Read church announcements with different priority levels
- Get updates on important church news

## Database Setup

### Step 1: Create Database Tables
You need to create three new tables in your `usersdb` database:

1. Open MySQL Workbench or your MySQL command line
2. Connect to your database (root/41674473)
3. Select the `usersdb` database
4. Run the SQL script located at: `my-node-server/database/setup_events.sql`

Alternatively, copy and paste these commands:

```sql
-- Switch to your database
USE usersdb;

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
```

### Step 2: Insert Sample Data (Optional)
The SQL script also includes sample events and announcements. These will help you test the feature immediately.

## How to Use

### Starting the Server
1. Open terminal in `my-node-server` directory
2. Run: `node src/server.js` or `npm run dev`
3. Server should start on http://localhost:8000

### Accessing Events Page
1. Login to your account at: http://localhost:8000/logins/login.html
2. Navigate to the dashboard
3. Click on "Events" in the sidebar menu
4. You'll see three tabs:
   - **Upcoming Events**: All future events
   - **Announcements**: Church announcements and news
   - **Past Events**: Historical events (up to 20 most recent)

### Features Available

#### For Members:
1. **View Events**: Browse all upcoming church events with details
2. **Filter Events**: Filter by category using the dropdown
3. **RSVP**: Click "RSVP" button to register for an event
4. **View Details**: Click on any event card to see full details in a modal
5. **Cancel RSVP**: Click "Registered ✓" button to cancel your registration
6. **Read Announcements**: Stay updated with church news
7. **Priority Badges**: Announcements are color-coded:
   - Red: Important
   - Blue: Info
   - Gray: General

#### Event Categories:
- **Services**: Regular worship services
- **Bible Study**: Bible study sessions
- **Youth**: Youth and young adult events
- **Prayer**: Prayer meetings and prayer chains
- **Community**: Community outreach and service
- **Special**: Special events (concerts, seminars, etc.)

## API Endpoints Created

### Events Endpoints:
- `GET /api/events/upcoming` - Get all upcoming events
- `GET /api/events/past` - Get past events (last 20)
- `GET /api/events/:id` - Get single event details
- `POST /api/events/rsvp` - Register for an event
- `DELETE /api/events/rsvp` - Cancel RSVP

### Announcements Endpoints:
- `GET /api/announcements` - Get all announcements (last 50)

## Files Created/Modified

### New Files:
1. `/public/dashboard/events.html` - Events page HTML
2. `/public/dashboard/events.css` - Events page styles
3. `/public/dashboard/events.js` - Events page functionality
4. `/database/setup_events.sql` - Database setup script

### Modified Files:
1. `/src/server.js` - Added API endpoints
2. `/public/dashboard/dashboard.html` - Updated Events link

## Future Enhancements

Possible additions to consider:
1. **Event Creation**: Allow admins to create events from the dashboard
2. **Announcement Management**: Create/edit/delete announcements
3. **Email Notifications**: Send reminders to RSVP'd members
4. **Calendar View**: Display events in a calendar format
5. **Event Comments**: Allow members to comment on events
6. **Photo Gallery**: Upload event photos
7. **Recurring Events**: Support for weekly/monthly recurring events
8. **Export Calendar**: Export events to Google Calendar/iCal

## Troubleshooting

### Database Connection Issues:
- Verify MySQL is running
- Check credentials in `server.js` (root/41674473)
- Ensure `usersdb` database exists

### Events Not Loading:
- Check browser console for errors
- Verify server is running on port 8000
- Check that tables were created successfully
- Look at server terminal for error messages

### RSVP Not Working:
- Make sure you're logged in (check localStorage for userData)
- Verify `event_rsvps` table exists
- Check server logs for database errors

## Testing Checklist

- [ ] Database tables created successfully
- [ ] Sample data inserted
- [ ] Server starts without errors
- [ ] Can login and access dashboard
- [ ] Events page loads
- [ ] Can see upcoming events
- [ ] Can filter events by category
- [ ] Can click event card to see details modal
- [ ] Can RSVP for an event
- [ ] Can cancel RSVP
- [ ] Can view announcements tab
- [ ] Can view past events tab
- [ ] Hamburger menu works on mobile
- [ ] Logout works properly

## Support

If you encounter any issues:
1. Check the browser console (F12) for JavaScript errors
2. Check the server terminal for backend errors
3. Verify all database tables exist
4. Make sure you're using the correct MySQL credentials
5. Clear browser cache and localStorage if needed

---

**Note**: The sample events use future dates relative to November 2024. You may want to update the dates in the SQL script to match your current date for testing purposes.
