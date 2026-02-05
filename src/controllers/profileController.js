const supabase = require('../db');

// Get user profile
const getProfile = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      return res.status(500).json({ success: false, message: "Server error" });
    }

    const user = { ...data }; // this is a spread operator to create a shallow copy of data
    delete user.password;

    res.json({ success: true, profile: user });
  } catch (err) {
    console.error("Error fetching profile:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  const {
    email, userName, phone, dateOfBirth, gender, maritalStatus,
    address, city, state, zipCode, country, memberSince, ministry, notes
  } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        username: userName,
        phone,
        dateofbirth: dateOfBirth,
        gender,
        maritalstatus: maritalStatus,
        address,
        city,
        state,
        zipcode: zipCode,
        country,
        membersince: memberSince,
        ministry,
        notes
      })
      .eq('email', email)
      .select();

    if (error) {
      console.error("Error updating profile:", error);
      return res.status(500).json({ success: false, message: "Database error: " + error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error updating profile:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getProfile,
  updateProfile
};
