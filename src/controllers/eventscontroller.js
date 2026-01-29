// this is where the events are going to be managed
const supabase = require('../db');

const upcomingEvents = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('date', today)
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) {
      console.error("Error fetching events:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
    res.json({ success: true, events: data });
  } catch (err) {
    console.error("Error fetching events:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { upcomingEvents };