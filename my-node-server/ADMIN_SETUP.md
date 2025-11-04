# Admin Panel Setup Guide

## Overview
The Admin Panel allows church administrators to:
- Create, edit, and delete events
- Create, edit, and delete announcements
- View all church members
- View event RSVPs
- Monitor dashboard statistics

## Database Setup

### Step 1: Add Admin Role to Users Table
Run this SQL command in MySQL:

```sql
USE usersdb;

-- Add role column to users table
ALTER TABLE users ADD COLUMN role ENUM('member', 'admin') DEFAULT 'member' AFTER password;
```

### Step 2: Create Admin User
Run the SQL script located at: `my-node-server/database/setup_admin.sql`

Or run this command:

```sql
-- Create an admin user
-- Password: admin123 (hashed with bcrypt)
INSERT INTO users (userName, email, phone, password, role) 
VALUES (
    'Admin User', 
    'admin@focm.com', 
    '555-0100',
    '$2a$10$rOzJw5K5EHVJxH7YxXxCaO9rL4Z8.2vQN6FJPxYxGBE2wQJ5xGxK2',
    'admin'
);
```

**Default Admin Credentials:**
- Email: `admin@focm.com`
- Password: `admin123`

⚠️ **IMPORTANT:** Change the admin password after first login!

## How to Access Admin Panel

1. Start your server:
   ```powershell
   cd my-node-server
   node src/server.js
   ```

2. Navigate to: http://localhost:8000/admin/admin-login.html

3. Login with admin credentials

## Admin Panel Features

### Dashboard
- **Statistics Cards**: View counts for events, announcements, members, and RSVPs
- **Quick Actions**: Fast access to create new events or announcements

### Manage Events
- **View All Events**: See all events in a table format
- **Add New Event**: Create events with:
  - Title
  - Category (Service, Bible Study, Youth, Prayer, Community, Special)
  - Date and Time
  - Location
  - Description
  - Additional Information
  - Image URL
- **Edit Event**: Modify existing event details
- **Delete Event**: Remove events (also deletes all RSVPs)

### Manage Announcements
- **View All Announcements**: See all announcements in a table
- **Add New Announcement**: Create announcements with:
  - Title
  - Content
  - Priority (Important, Info, General)
  - Author
  - Date
- **Edit Announcement**: Modify existing announcements
- **Delete Announcement**: Remove announcements

### View Members
- See all registered church members
- View member details:
  - Name
  - Email
  - Phone
  - Member Since date
  - Ministry involvement

### View RSVPs
- See all event registrations
- Filter RSVPs by specific events
- View:
  - Event name
  - Member name
  - Email
  - RSVP date and time

## Admin Panel Structure

### Files Created:
```
/public/admin/
├── admin-login.html         - Admin login page
├── admin-login.css          - Login page styles
├── admin-login.js           - Login functionality
├── admin-dashboard.html     - Admin dashboard
├── admin-dashboard.css      - Dashboard styles
└── admin-dashboard.js       - Dashboard functionality
```

### API Endpoints Added:

#### Admin Authentication:
- `POST /api/admin/login` - Admin login

#### Events Management:
- `GET /api/admin/events` - Get all events
- `GET /api/admin/events/:id` - Get single event
- `POST /api/admin/events` - Create new event
- `PUT /api/admin/events/:id` - Update event
- `DELETE /api/admin/events/:id` - Delete event

#### Announcements Management:
- `GET /api/admin/announcements` - Get all announcements
- `GET /api/admin/announcements/:id` - Get single announcement
- `POST /api/admin/announcements` - Create new announcement
- `PUT /api/admin/announcements/:id` - Update announcement
- `DELETE /api/admin/announcements/:id` - Delete announcement

#### Member & RSVP Management:
- `GET /api/admin/members` - Get all members
- `GET /api/admin/rsvps` - Get all RSVPs

#### Dashboard Statistics:
- `GET /api/admin/events/count` - Count total events
- `GET /api/admin/announcements/count` - Count total announcements
- `GET /api/admin/members/count` - Count total members
- `GET /api/admin/rsvps/count` - Count total RSVPs

## How to Create Admin Users

### Method 1: Via MySQL (Recommended)
```sql
-- Hash your password first (use bcrypt with salt rounds 10)
-- Then insert:
INSERT INTO users (userName, email, phone, password, role) 
VALUES ('Your Name', 'your-email@example.com', 'your-phone', 'hashed-password-here', 'admin');
```

### Method 2: Upgrade Existing User
```sql
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
```

### Method 3: Create Password Hash
You can create a bcrypt hash using Node.js:

```javascript
const bcrypt = require('bcryptjs');
const password = 'your-password-here';
bcrypt.hash(password, 10, (err, hash) => {
    console.log('Hashed password:', hash);
});
```

## Security Considerations

1. **Change Default Password**: Change the default admin password immediately after first login

2. **Use Strong Passwords**: Admin passwords should be:
   - At least 12 characters long
   - Include uppercase and lowercase letters
   - Include numbers and special characters

3. **Limit Admin Access**: Only create admin accounts for trusted personnel

4. **Regular Audits**: Regularly review admin activities and access logs

5. **Database Backups**: Regularly backup your database before making bulk changes

## Common Tasks

### Adding a New Event
1. Login to admin panel
2. Click "Manage Events" in sidebar
3. Click "+ Add New Event" button
4. Fill in all required fields (marked with *)
5. Click "Save Event"

### Editing an Event
1. Navigate to "Manage Events"
2. Find the event in the table
3. Click "Edit" button
4. Modify the fields
5. Click "Save Event"

### Creating an Announcement
1. Click "Manage Announcements"
2. Click "+ Add New Announcement"
3. Fill in the form
4. Select priority level:
   - **Important**: Red badge, urgent news
   - **Info**: Blue badge, informational updates
   - **General**: Gray badge, routine announcements
5. Click "Save Announcement"

### Viewing Member RSVPs
1. Click "Event RSVPs" in sidebar
2. Use the filter dropdown to view RSVPs for specific events
3. Select "All Events" to see all RSVPs

## Troubleshooting

### Cannot Login to Admin Panel
- Verify admin user exists in database:
  ```sql
  SELECT * FROM users WHERE role = 'admin';
  ```
- Check that password is correct (default: admin123)
- Verify server is running on port 8000
- Check browser console for errors

### Events/Announcements Not Saving
- Verify database tables exist (events, announcements)
- Check that all required fields are filled
- Look at server terminal for error messages
- Verify database connection is active

### "Database not connected" Error
- Check MySQL is running
- Verify credentials in `server.js` (root/41674473)
- Ensure `usersdb` database exists
- Check all tables are created

### Changes Not Appearing for Members
- Make sure you click "Save" after editing
- Refresh the member-facing events page
- Check that the event date is in the future for upcoming events
- Verify the data was saved in database

## Testing Checklist

- [ ] Database role column added
- [ ] Admin user created successfully
- [ ] Can login to admin panel
- [ ] Dashboard statistics display correctly
- [ ] Can create new event
- [ ] Can edit existing event
- [ ] Can delete event
- [ ] Can create new announcement
- [ ] Can edit existing announcement
- [ ] Can delete announcement
- [ ] Members list displays correctly
- [ ] RSVPs list displays correctly
- [ ] Filter RSVPs by event works
- [ ] Hamburger menu works on mobile
- [ ] Changes appear on member-facing pages
- [ ] Logout works properly

## Future Enhancements

Possible additions:
1. **User Management**: Edit/delete member accounts
2. **Activity Logs**: Track admin actions
3. **Bulk Operations**: Bulk delete/edit events
4. **Email Notifications**: Send emails to members about new events
5. **Image Upload**: Upload event images instead of URLs
6. **Event Templates**: Save and reuse event templates
7. **Analytics**: View event attendance trends
8. **Role Permissions**: Multiple admin roles with different permissions
9. **Approval Workflow**: Require approval before publishing
10. **Export Data**: Export members, RSVPs to CSV/Excel

## Support

If you need help:
1. Check the browser console (F12) for JavaScript errors
2. Check the server terminal for backend errors
3. Verify database tables and data exist
4. Ensure you're using correct admin credentials
5. Clear browser cache and localStorage if needed

---

**Security Note**: Keep your admin credentials secure and change default passwords immediately!
