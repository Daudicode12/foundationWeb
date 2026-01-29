const supabase = require('../db');

// Get all sermons
const getAllSermons = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .order('date', { ascending: false })
      .order('time', { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching sermons:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
    res.json({ success: true, data });
  } catch (err) {
    console.error("Error fetching sermons:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get upcoming sermons
const getUpcomingSermons = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .gte('date', today)
      .order('date', { ascending: true })
      .order('time', { ascending: true })
      .limit(10);

    if (error) {
      console.error("Error fetching upcoming sermons:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
    res.json({ success: true, data });
  } catch (err) {
    console.error("Error fetching upcoming sermons:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get single sermon
const getSermonById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching sermon:", error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: "Sermon not found" });
      }
      return res.status(500).json({ success: false, message: "Server error" });
    }
    res.json({ success: true, data });
  } catch (err) {
    console.error("Error fetching sermon:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get sermons by day type
const getSermonsByDayType = async (req, res) => {
  const { dayType } = req.params;

  try {
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .eq('day_type', dayType)
      .order('date', { ascending: false })
      .order('time', { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching sermons by day type:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
    res.json({ success: true, data });
  } catch (err) {
    console.error("Error fetching sermons by day type:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getAllSermons,
  getUpcomingSermons,
  getSermonById,
  getSermonsByDayType
};
