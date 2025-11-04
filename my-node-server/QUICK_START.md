# 🎉 Admin Panel Complete Setup Guide

## Quick Start (3 Steps)

### Step 1: Setup Database
Run these SQL commands in MySQL:

```sql
USE usersdb;

-- Add role column
ALTER TABLE users ADD COLUMN role ENUM('member', 'admin') DEFAULT 'member' AFTER password;

-- Create admin user (email: admin@focm.com, password: admin123)
INSERT INTO users (userName, email, phone, password, role) 
VALUES (
    'Admin User', 
    'admin@focm.com', 
    '555-0100',
    '$2a$10$rOzJw5K5EHVJxH7YxXxCaO9rL4Z8.2vQN6FJPxYxGBE2wQJ5xGxK2',
    'admin'
);
```

### Step 2: Restart Server
```powershell
cd my-node-server
node src/server.js
```

### Step 3: Login to Admin Panel
1. Go to: http://localhost:8000/admin/admin-login.html
2. Login with:
   - Email: `admin@focm.com`
   - Password: `admin123`

**⚠️ IMPORTANT: Change the admin password immediately after first login!**

## What You Can Do Now

### ✅ Manage Events
- Create new church events
- Edit existing events
- Delete events
- Set categories, dates, times, locations
- Add descriptions and images

### ✅ Manage Announcements  
- Create church announcements
- Set priority levels (Important, Info, General)
- Edit and delete announcements
- Members see announcements on events page

### ✅ View Members
- See all registered members
- View member details
- Monitor membership growth

### ✅ Track RSVPs
- See who registered for events
- Filter by specific events
- Monitor attendance

## How Members Access Events

Members can view events and announcements at:
- http://localhost:8000/dashboard/events.html

They can:
- Browse upcoming events
- RSVP for events
- Read announcements
- Filter events by category

## Admin vs Member Access

### Admin Can:
- ✅ Create/Edit/Delete events
- ✅ Create/Edit/Delete announcements
- ✅ View all members
- ✅ View all RSVPs
- ✅ Access admin dashboard

### Members Can:
- ✅ View events
- ✅ RSVP for events
- ✅ Read announcements
- ✅ Edit their profile
- ❌ Cannot create/edit events
- ❌ Cannot manage announcements

## Quick Access Links

### For Admins:
- Admin Login: http://localhost:8000/admin/admin-login.html
- Admin Dashboard: http://localhost:8000/admin/admin-dashboard.html

### For Members:
- Member Login: http://localhost:8000/logins/login.html
- Member Dashboard: http://localhost:8000/dashboard/dashboard.html
- Events Page: http://localhost:8000/dashboard/events.html

## Creating Additional Admins

To make an existing user an admin:

```sql
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
```

Or create a new admin user (after hashing password with bcrypt):

```sql
INSERT INTO users (userName, email, phone, password, role) 
VALUES ('Admin Name', 'admin@example.com', 'phone', 'hashed-password', 'admin');
```

## Complete File Structure

```
my-node-server/
├── src/
│   └── server.js              (Updated with admin API endpoints)
├── public/
│   ├── admin/                 (NEW)
│   │   ├── admin-login.html
│   │   ├── admin-login.css
│   │   ├── admin-login.js
│   │   ├── admin-dashboard.html
│   │   ├── admin-dashboard.css
│   │   └── admin-dashboard.js
│   └── dashboard/
│       ├── dashboard.html     (Updated with admin link)
│       ├── events.html        (Members view events here)
│       ├── events.css
│       └── events.js
├── database/
│   ├── setup_events.sql       (Run this first - creates event tables)
│   └── setup_admin.sql        (Run this second - adds admin user)
├── EVENTS_SETUP.md            (Events feature documentation)
└── ADMIN_SETUP.md             (Detailed admin documentation)
```

## Testing Checklist

- [ ] SQL commands executed successfully
- [ ] Server restarts without errors
- [ ] Can login to admin panel
- [ ] Dashboard shows statistics
- [ ] Can create a new event
- [ ] Event appears on member events page
- [ ] Can edit and delete events
- [ ] Can create announcements
- [ ] Announcements appear for members
- [ ] Can view members list
- [ ] Can view RSVPs
- [ ] Admin link appears in member dashboard sidebar

## Troubleshooting

### "Invalid admin credentials"
- Check that the SQL INSERT command ran successfully
- Verify email is `admin@focm.com` and password is `admin123`
- Check database: `SELECT * FROM users WHERE role = 'admin';`

### "Database not connected"
- Verify MySQL is running
- Check server.js credentials (root/41674473)
- Restart the server

### Changes not appearing
- Clear browser cache
- Check browser console (F12) for errors
- Verify data was saved in database
- Refresh the page

## Next Steps

1. **Change Admin Password**: For security, change the default password
2. **Add Real Events**: Replace sample events with your church's actual events
3. **Create Announcements**: Add current church announcements
4. **Test Member Flow**: Test RSVP functionality from member perspective
5. **Add More Admins**: Create admin accounts for other church leaders

## Need Help?

Check these files for detailed documentation:
- `EVENTS_SETUP.md` - Events & Announcements setup
- `ADMIN_SETUP.md` - Complete admin panel documentation

---

**Security Reminder**: Always use strong passwords and keep admin credentials secure!
