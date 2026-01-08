# Admin Panel Access Guide

## Problem: Cannot GET /admin/admin-dashboard.html

This error means the file path is incorrect or the server isn't running properly.

---

## ✅ CORRECT URLs to Access Admin Panel

### Starting Point - Admin Login:
```
http://localhost:8000/admin/admin-login.html
```

### After Login - Admin Dashboard:
```
http://localhost:8000/admin/admin-dashboard.html
```

---

## Quick Fix Steps:

### 1. Make Sure Server is Running
```powershell
cd my-node-server
node src/server.js
```

You should see:
```
Server Running on Port Http://localhost:8000
Connected to the MySQL database.
```

### 2. Access Admin Login Page
Open your browser and go to:
```
http://localhost:8000/admin/admin-login.html
```

### 3. Login with Admin Credentials
**IMPORTANT**: First create the admin user if you haven't:
```powershell
node scripts/seedAdmin.js
```

Then login with:
- **Email**: `admin@focm.church`
- **Password**: `Admin123!`

### 4. You'll Be Automatically Redirected
After successful login, you'll be redirected to:
```
http://localhost:8000/admin/admin-dashboard.html
```

---

## Common Mistakes:

### ❌ WRONG URLs (Don't use these):
```
http://localhost:8000/admin/admin/admin-dashboard.html  ← Extra /admin
http://localhost:8000/public/admin/admin-dashboard.html ← /public not needed
http://localhost:3000/admin/admin-dashboard.html        ← Wrong port
```

### ✅ CORRECT URL:
```
http://localhost:8000/admin/admin-login.html
```

---

## Testing Direct Access

You can test if the files are accessible:

### Test 1: Check if admin login page loads
```
http://localhost:8000/admin/admin-login.html
```
**Expected**: Login form appears

### Test 2: Check if CSS loads
```
http://localhost:8000/admin/admin-login.css
```
**Expected**: CSS code appears

### Test 3: After login, dashboard loads
```
http://localhost:8000/admin/admin-dashboard.html
```
**Expected**: Dashboard with stats (after login)

---

## Troubleshooting:

### If "Cannot GET" error persists:

1. **Verify server is running**:
   ```powershell
   cd my-node-server
   node src/server.js
   ```

2. **Check if files exist**:
   ```powershell
   dir public\admin\
   ```
   You should see:
   - admin-login.html
   - admin-login.css
   - admin-login.js
   - admin-dashboard.html
   - admin-dashboard.css
   - admin-dashboard.js

3. **Check the port**:
   - Server runs on port **8000**
   - Make sure no other app is using that port

4. **Clear browser cache**:
   - Press `Ctrl + Shift + R` to hard refresh
   - Or open in incognito mode

5. **Check browser console**:
   - Press `F12` to open DevTools
   - Look for errors in Console tab

---

## Step-by-Step Access:

### Step 1: Start Server
```powershell
cd C:\myprojects\foundationWeb-main\my-node-server
node src/server.js
```

### Step 2: Open Browser
Go to: `http://localhost:8000/admin/admin-login.html`

### Step 3: Login
- Email: `admin@focm.church`
- Password: `Admin123!`

### Step 4: Dashboard Appears
You'll be on: `http://localhost:8000/admin/admin-dashboard.html`

---

## File Structure (for reference):

```
my-node-server/
├── src/
│   └── server.js              ← Serves files from /public
├── public/                    ← Static files served here
│   ├── admin/                 ← Admin folder
│   │   ├── admin-login.html   ← Access at /admin/admin-login.html
│   │   ├── admin-login.css
│   │   ├── admin-login.js
│   │   ├── admin-dashboard.html ← Access at /admin/admin-dashboard.html
│   │   ├── admin-dashboard.css
│   │   └── admin-dashboard.js
│   ├── dashboard/
│   ├── logins/
│   └── signup/
```

---

## Quick Test Command

Run this in PowerShell to test if server is working:

```powershell
# Start server in background
cd my-node-server
Start-Process powershell -ArgumentList "node src/server.js"

# Wait 2 seconds
Start-Sleep -Seconds 2

# Open browser to admin login
Start-Process "http://localhost:8000/admin/admin-login.html"
```

---

## Still Not Working?

If you still see "Cannot GET /admin/admin-dashboard.html":

1. **Show me the error**:
   - Take a screenshot
   - Check browser DevTools Console (F12)
   - Check server terminal for errors

2. **Verify URL**:
   - Copy-paste from browser address bar
   - Make sure it's exactly: `http://localhost:8000/admin/admin-login.html`

3. **Check server output**:
   - Does it say "Server Running on Port Http://localhost:8000"?
   - Does it say "Connected to the MySQL database"?

4. **Try member dashboard** (to verify server works):
   - Go to: `http://localhost:8000/logins/login.html`
   - If this works, admin panel should work too

---

## Quick Access Bookmark

Bookmark these URLs:

- 👤 **Member Login**: `http://localhost:8000/logins/login.html`
- 🔐 **Admin Login**: `http://localhost:8000/admin/admin-login.html`
- 📊 **Admin Dashboard**: `http://localhost:8000/admin/admin-dashboard.html`

---

**The files are there, you just need to access them at the right URL!** 🚀
