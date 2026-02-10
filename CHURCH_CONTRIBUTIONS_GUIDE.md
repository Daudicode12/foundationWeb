# Church Contribution Tracking System

This guide explains how to set up and use the multi-church contribution tracking system with super admin capabilities.

## Overview

The system allows you to:
- Manage multiple churches/branches
- Set annual contribution targets for each church
- Track contributions from each church
- Monitor progress towards contribution goals
- Generate reports and view analytics

## Setup Instructions

### 1. Database Setup

Run the database schema to create the necessary tables:

```bash
# In Supabase SQL Editor, run:
# 1. First, run setup_churches.sql to create tables
# 2. Then run setup_super_admin.sql for sample data (optional)
```

Files to run:
- `database/setup_churches.sql` - Creates churches, targets, and contributions tables
- `database/setup_super_admin.sql` - Creates sample data (optional)

### 2. Create Super Admin User

Option A: Using the seed script:
```bash
cd foundationWeb
node scripts/seedSuperAdmin.js
```

Or with custom credentials:
```bash
SUPER_ADMIN_EMAIL=admin@yourorg.com SUPER_ADMIN_PASSWORD=SecurePass123! node scripts/seedSuperAdmin.js
```

Option B: Update an existing admin in database:
```sql
UPDATE users SET role = 'super_admin' WHERE email = 'existing-admin@email.com';
```

### 3. Login as Super Admin

1. Go to `/admin/login`
2. Enter your super admin credentials
3. You'll be automatically redirected to `/super-admin/dashboard`

## User Roles

| Role | Access Level |
|------|-------------|
| `member` | Member dashboard, profile, events, etc. |
| `admin` | Admin dashboard + church contribution recording |
| `super_admin` | Full access including church management, targets, and progress monitoring |

## Features

### For Super Admin

#### Dashboard (`/super-admin/dashboard`)
- Overview of all churches
- Total contributions this year/month
- Overall progress percentage
- Quick view of church progress

#### Manage Churches
- Add/Edit/Delete churches
- Each church has:
  - Unique code (e.g., FCM-001)
  - Name, address, city, region
  - Contact info (phone, email)
  - Pastor name
  - Active/Inactive status

#### Set Contribution Targets
- Set yearly targets for each church
- View targets by year
- Update or remove targets

#### Record Contributions
- Record contributions from churches
- Track payment method (cash, check, bank transfer, mobile money, online)
- Add reference/receipt numbers
- Filter by church, year, date range

#### View Progress
- See progress for all churches
- Detailed progress per church
- Monthly breakdown charts
- On-track vs behind indicators

### For Regular Admin

Regular admins can:
- Record contributions for churches
- View contribution history
- Access regular admin dashboard features

## API Endpoints

### Super Admin Only (requires `super_admin` role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/super-admin/stats` | Dashboard statistics |
| GET | `/api/super-admin/churches` | List all churches |
| POST | `/api/super-admin/churches` | Create church |
| PUT | `/api/super-admin/churches/:id` | Update church |
| DELETE | `/api/super-admin/churches/:id` | Delete church |
| POST | `/api/super-admin/targets` | Set contribution target |
| GET | `/api/super-admin/targets/year/:year` | Get targets by year |
| GET | `/api/super-admin/progress/:year` | Get all churches progress |
| GET | `/api/super-admin/progress/church/:id/year/:year` | Get single church progress |

### Admin Routes (accessible by both `admin` and `super_admin`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/super-admin/active-churches` | List active churches |
| GET | `/api/super-admin/contributions` | List contributions |
| POST | `/api/super-admin/contributions` | Record contribution |
| PUT | `/api/super-admin/contributions/:id` | Update contribution |
| DELETE | `/api/super-admin/contributions/:id` | Delete contribution |

## Database Schema

### Churches Table
```sql
churches (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  code VARCHAR(50) UNIQUE,
  address TEXT,
  city VARCHAR(100),
  region VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(255),
  pastor_name VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE
)
```

### Contribution Targets Table
```sql
church_contribution_targets (
  id SERIAL PRIMARY KEY,
  church_id INT REFERENCES churches(id),
  year INT,
  target_amount DECIMAL(12, 2),
  description TEXT,
  UNIQUE(church_id, year)
)
```

### Church Contributions Table
```sql
church_contributions (
  id SERIAL PRIMARY KEY,
  church_id INT REFERENCES churches(id),
  amount DECIMAL(12, 2),
  contribution_date DATE,
  payment_method VARCHAR(30),
  reference_number VARCHAR(100),
  description TEXT,
  receipt_number VARCHAR(100),
  recorded_by INT REFERENCES users(id)
)
```

## Security Notes

1. Super admin routes are protected by the `superAdminAuth` middleware
2. Tokens are stored in httpOnly cookies for security
3. All database operations use parameterized queries
4. Passwords are hashed using bcrypt

## Troubleshooting

### Can't access Super Admin Dashboard?
- Verify your user has `role = 'super_admin'` in the database
- Clear browser cookies and try logging in again
- Check browser console for any errors

### Churches not showing?
- Run the database migration scripts
- Check if churches have `is_active = true`

### Progress not calculating correctly?
- Ensure targets are set for the current year
- Verify contribution dates are within the selected year

## Support

For issues or questions, check the server logs or contact the development team.
