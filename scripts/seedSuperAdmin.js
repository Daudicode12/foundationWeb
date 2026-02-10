/**
 * Seed Super Admin User Script
 * 
 * This script creates a super admin user for the church contribution tracking system.
 * 
 * Usage:
 *   node scripts/seedSuperAdmin.js
 * 
 * Or with custom email/password:
 *   SUPER_ADMIN_EMAIL=admin@example.com SUPER_ADMIN_PASSWORD=YourPassword123 node scripts/seedSuperAdmin.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Default super admin credentials (override with environment variables)
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'superadmin@focm.org';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin123!';
const SUPER_ADMIN_NAME = process.env.SUPER_ADMIN_NAME || 'Super Admin';
const SUPER_ADMIN_PHONE = process.env.SUPER_ADMIN_PHONE || '+254700000000';

async function seedSuperAdmin() {
  console.log('🚀 Starting Super Admin seed process...\n');

  try {
    // Check if super admin already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', SUPER_ADMIN_EMAIL)
      .single();

    if (existingUser) {
      if (existingUser.role === 'super_admin') {
        console.log(`✅ Super Admin already exists with email: ${SUPER_ADMIN_EMAIL}`);
        console.log('ℹ️  No changes made.');
        return;
      } else {
        // Update existing user to super_admin
        const { error: updateError } = await supabase
          .from('users')
          .update({ role: 'super_admin' })
          .eq('id', existingUser.id);

        if (updateError) {
          throw new Error(`Failed to update user role: ${updateError.message}`);
        }

        console.log(`✅ Updated existing user to super_admin role`);
        console.log(`   Email: ${SUPER_ADMIN_EMAIL}`);
        return;
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);

    // Create new super admin user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{
        username: SUPER_ADMIN_NAME,
        email: SUPER_ADMIN_EMAIL,
        phone: SUPER_ADMIN_PHONE,
        password: hashedPassword,
        role: 'super_admin'
      }])
      .select();

    if (insertError) {
      throw new Error(`Failed to create super admin: ${insertError.message}`);
    }

    console.log('✅ Super Admin created successfully!\n');
    console.log('📧 Email:', SUPER_ADMIN_EMAIL);
    console.log('🔑 Password:', SUPER_ADMIN_PASSWORD);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the seed function
seedSuperAdmin().then(() => {
  console.log('\n✅ Seed process completed.');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Seed process failed:', error);
  process.exit(1);
});
