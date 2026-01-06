// Script to create an admin user
// Run with: node scripts/seedAdmin.js

const bcrypt = require('bcryptjs');
const db = require('../src/db');

const adminData = {
  userName: 'Admin User',
  email: 'admin@focm.church',
  phone: '0727600414',
  password: 'Admin123!', // Change this password immediately after first login
  role: 'admin'
};

async function createAdmin() {
  try {
    // Check if admin already exists
    db.query('SELECT * FROM users WHERE email = ?', [adminData.email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        process.exit(1);
      }

      if (results.length > 0) {
        console.log('Admin user already exists with email:', adminData.email);
        process.exit(0);
      }

      // Hash password
      const hash = await bcrypt.hash(adminData.password, 10);

      // Insert admin user
      const sql = 'INSERT INTO users (userName, email, phone, password, role) VALUES (?, ?, ?, ?, ?)';
      db.query(sql, [adminData.userName, adminData.email, adminData.phone, hash, adminData.role], (err, result) => {
        if (err) {
          console.error('Error creating admin user:', err);
          process.exit(1);
        }

        console.log('✅ Admin user created successfully!');
        console.log('-----------------------------------');
        console.log('Email:', adminData.email);
        console.log('Password:', adminData.password);
        console.log('-----------------------------------');
        console.log('⚠️  IMPORTANT: Change this password after first login!');
        
        db.end();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();
