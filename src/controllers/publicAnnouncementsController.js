const supabase = require('../db');

// Get all announcements (public)
const getAllAnnouncements = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching announcements:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
    res.json(data);
  } catch (err) {
    console.error("Error fetching announcements:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getAllAnnouncements
};
