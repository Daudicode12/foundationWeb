# Modular Server Setup Complete! 🎉

## What Changed?

Your server has been **refactored** into a clean, modular structure. The functionality is **exactly the same**, but the code is now organized into separate files.

### Before vs After:
- **Before**: `server.js` had 600+ lines of code
- **After**: `server.js` has only **406 lines** 
- **Admin code**: Moved to separate modules (routes, controllers, middleware)

---

## New File Structure

```
my-node-server/
├── src/
│   ├── server.js              ← Main server (now cleaner!)
│   ├── db.js                  ← Database connection (centralized)
│   ├── routes/
│   │   └── admin.js           ← Admin route definitions
│   ├── controllers/
│   │   └── adminController.js ← Admin business logic
│   └── middleware/
│       └── adminAuth.js       ← Admin authentication
├── scripts/
│   └── seedAdmin.js          ← Create admin user
└── database/
    └── add_role_column.sql   ← Add role column to users table
```

---

## Setup Steps (Follow in order)

### Step 1: Add Role Column to Database

Run this SQL in MySQL Workbench or command line:

```sql
USE usersdb;

ALTER TABLE users
  ADD COLUMN role VARCHAR(32) DEFAULT 'member';

UPDATE users SET role = 'member' WHERE role IS NULL;
```

OR use the provided SQL file:
```powershell
# From MySQL command line:
mysql -u root -p41674473 usersdb < database/add_role_column.sql
```

### Step 2: Create Admin User

Run the seed script from the `my-node-server` directory:

```powershell
cd my-node-server
node scripts/seedAdmin.js
```

This creates an admin account:
- **Email**: `admin@focm.church`
- **Password**: `Admin123!`

⚠️ **IMPORTANT**: Change this password after first login!

### Step 3: Start the Server

```powershell
cd my-node-server
node src/server.js
```

Or use nodemon for development:
```powershell
npm run dev
```

---

## How It Works

### The Modular Approach

#### 1. Database Connection (`src/db.js`)
- Single file that handles MySQL connection
- Imported by server.js and controllers
- No duplicate connection code

#### 2. Admin Router (`src/routes/admin.js`)
- Defines all admin endpoints
- Uses Express Router
- All routes are protected with `adminAuth` middleware
- Mounted at `/api/admin` in server.js

**Available Routes:**
```
GET    /api/admin/stats              - Dashboard statistics
GET    /api/admin/events             - List all events
POST   /api/admin/events             - Create new event
GET    /api/admin/events/:id         - Get single event
PUT    /api/admin/events/:id         - Update event
DELETE /api/admin/events/:id         - Delete event
GET    /api/admin/announcements      - List all announcements
POST   /api/admin/announcements      - Create announcement
GET    /api/admin/announcements/:id  - Get single announcement
PUT    /api/admin/announcements/:id  - Update announcement
DELETE /api/admin/announcements/:id  - Delete announcement
```

#### 3. Admin Controller (`src/controllers/adminController.js`)
- Contains all business logic
- Handles database queries
- Error handling
- Response formatting

**Functions:**
- `listEvents()` - Get all events
- `createEvent()` - Create new event
- `updateEvent()` - Update event
- `deleteEvent()` - Delete event
- `listAnnouncements()` - Get all announcements
- `createAnnouncement()` - Create announcement
- `updateAnnouncement()` - Update announcement
- `deleteAnnouncement()` - Delete announcement
- `getDashboardStats()` - Get counts for dashboard

#### 4. Admin Middleware (`src/middleware/adminAuth.js`)
- Checks if user is admin
- Simple email-based auth (for now)
- Can be upgraded to JWT later

---

## Testing the Setup

### 1. Test Admin Login

```powershell
# Using curl:
curl -X POST http://localhost:8000/api/admin/login -H "Content-Type: application/json" -d "{\"email\":\"admin@focm.church\",\"password\":\"Admin123!\"}"
```

Or use Postman:
- Method: POST
- URL: http://localhost:8000/api/admin/login
- Body (JSON):
```json
{
  "email": "admin@focm.church",
  "password": "Admin123!"
}
```

Expected response:
```json
{
  "success": true,
  "message": "Admin login successful",
  "email": "admin@focm.church",
  "userName": "Admin User",
  "role": "admin"
}
```

### 2. Test Admin Endpoints

Get all events (requires adminEmail in body/query):
```powershell
curl -X GET "http://localhost:8000/api/admin/events?adminEmail=admin@focm.church"
```

Create event:
```powershell
curl -X POST http://localhost:8000/api/admin/events -H "Content-Type: application/json" -d "{\"adminEmail\":\"admin@focm.church\",\"title\":\"Test Event\",\"description\":\"Test Description\",\"category\":\"service\",\"date\":\"2025-12-25\",\"time\":\"10:00 AM\",\"location\":\"Main Sanctuary\"}"
```

---

## Benefits of Modular Structure

### ✅ Cleaner Code
- Each file has a single responsibility
- Easy to find and fix bugs
- Better code organization

### ✅ Easier Maintenance
- Changes to admin logic only affect admin files
- No need to scroll through 600+ lines
- Clear separation of concerns

### ✅ Reusability
- Database connection used everywhere
- Controllers can be reused
- Middleware can protect multiple routes

### ✅ Scalability
- Easy to add new routes (just add to router)
- Easy to add new controllers
- Can add more middleware layers

### ✅ Team Collaboration
- Different team members can work on different files
- Less merge conflicts
- Clear file ownership

---

## Member vs Admin Routes

### Member Routes (Public)
- `/api/signup` - Register new member
- `/api/login` - Member login
- `/api/profile` - Get/update profile
- `/api/events/upcoming` - View upcoming events
- `/api/events/:id` - View event details
- `/api/events/rsvp` - RSVP for events
- `/api/announcements` - View announcements

### Admin Routes (Protected)
- `/api/admin/login` - Admin authentication
- `/api/admin/events` - Manage events (CRUD)
- `/api/admin/announcements` - Manage announcements (CRUD)
- `/api/admin/stats` - Dashboard statistics

---

## Next Steps

### 1. Update Admin Password
After first login, create a script or endpoint to change the admin password.

### 2. Upgrade Authentication
Consider implementing JWT tokens for better security:
- Install `jsonwebtoken`: `npm install jsonwebtoken`
- Update `adminAuth.js` to use JWT
- Return JWT token on login
- Client stores JWT and sends in Authorization header

### 3. Add More Controllers
You can create more modular controllers:
- `src/controllers/memberController.js` - Member management
- `src/controllers/eventController.js` - Public event viewing
- `src/controllers/authController.js` - Authentication logic

### 4. Create Member Routes
Similar to admin router:
- `src/routes/member.js` - Member-specific routes
- `src/middleware/memberAuth.js` - Member authentication

### 5. Add Input Validation
Install express-validator:
```powershell
npm install express-validator
```

Create validation middleware:
- `src/middleware/validateEvent.js`
- `src/middleware/validateAnnouncement.js`

---

## Troubleshooting

### Server won't start
- Check that `src/db.js` exists
- Verify MySQL is running
- Check database credentials

### Admin routes return 401
- Verify role column exists in users table
- Check admin user was created successfully
- Ensure you're sending `adminEmail` in request

### Can't create admin user
- Make sure role column was added first
- Check bcryptjs is installed: `npm list bcryptjs`
- Verify database connection

---

## File Sizes Comparison

Before:
```
server.js: 600+ lines
```

After:
```
server.js:              406 lines (-33%)
db.js:                   20 lines
routes/admin.js:         25 lines
controllers/admin.js:   180 lines
middleware/adminAuth.js: 60 lines
--------------------------------
Total:                  691 lines (but organized!)
```

The code is now **organized**, **maintainable**, and **scalable**!

---

## Questions?

If you need help:
1. Check the console for error messages
2. Verify all files were created
3. Test routes with Postman
4. Check MySQL for role column and admin user

**The server works exactly the same as before, just better organized!** 🚀
