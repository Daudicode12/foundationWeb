const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Validate Supabase credentials
if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in environment variables.");
  console.error("Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env file.");
  process.exit(1);
}

// Create Supabase client with service role key (for server-side operations)
// Service role key bypasses Row Level Security (RLS) - use only on server
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create a public client with anon key (for client-side operations, respects RLS)
const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

// Test the connection
async function testConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error) {
      console.error("Supabase connection test failed:", error.message);
      console.log("Make sure your database tables are created and RLS policies are configured.");
    } else {
      console.log("✅ Connected to Supabase database successfully!");
    }
  } catch (err) {
    console.error("Supabase connection error:", err.message);
  }
}

// Run connection test
testConnection();

// Export both clients
module.exports = supabase;
module.exports.supabasePublic = supabasePublic;
