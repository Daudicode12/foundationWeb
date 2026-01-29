const supabase = require('../db');

// Submit a prayer request (member/public)
const submitPrayerRequest = async (req, res) => {
  const { userId, userName, userEmail, title, request, isAnonymous } = req.body;

  if (!userName || !userEmail || !title || !request) {
    return res.status(400).json({ success: false, message: "All required fields must be filled" });
  }

  try {
    const { data, error } = await supabase
      .from('prayer_requests')
      .insert([{
        user_id: userId || null,
        user_name: userName,
        user_email: userEmail,
        title,
        request,
        is_anonymous: isAnonymous || false
      }])
      .select();

    if (error) {
      console.error("Error saving prayer request:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to submit your prayer request. Please try again later."
      });
    }

    res.json({
      success: true,
      message: "Your prayer request has been submitted. Our team will be praying for you.",
      prayerRequestId: data[0]?.id
    });
  } catch (err) {
    console.error("Error saving prayer request:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to submit your prayer request. Please try again later."
    });
  }
};

// Get user's prayer requests (member)
const getUserPrayerRequests = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    const { data, error } = await supabase
      .from('prayer_requests')
      .select('*')
      .eq('user_email', email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user prayer requests:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.json({ success: true, prayerRequests: data });
  } catch (err) {
    console.error('Error fetching user prayer requests:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all prayer requests (admin)
const listPrayerRequests = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('prayer_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching prayer requests:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.json({ success: true, prayerRequests: data });
  } catch (err) {
    console.error('Error fetching prayer requests:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get single prayer request (admin)
const getPrayerRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('prayer_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching prayer request:', error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Prayer request not found' });
      }
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.json({ success: true, prayerRequest: data });
  } catch (err) {
    console.error('Error fetching prayer request:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Mark prayer request as read (admin)
const markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('prayer_requests')
      .update({ is_read: true })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating prayer request:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Prayer request not found' });
    }
    res.json({ success: true, message: 'Prayer request marked as read' });
  } catch (err) {
    console.error('Error updating prayer request:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update prayer request status (admin)
const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!['pending', 'praying', 'answered'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    const { data, error } = await supabase
      .from('prayer_requests')
      .update({ status, is_read: true })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating prayer request status:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Prayer request not found' });
    }
    res.json({ success: true, message: 'Prayer request status updated' });
  } catch (err) {
    console.error('Error updating prayer request status:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete prayer request (admin)
const deletePrayerRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('prayer_requests')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error deleting prayer request:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Prayer request not found' });
    }
    res.json({ success: true, message: 'Prayer request deleted successfully' });
  } catch (err) {
    console.error('Error deleting prayer request:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Count unread prayer requests (admin)
const countUnread = async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('prayer_requests')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    if (error) {
      console.error('Error counting unread prayer requests:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.json({ success: true, count: count || 0 });
  } catch (err) {
    console.error('Error counting unread prayer requests:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  submitPrayerRequest,
  getUserPrayerRequests,
  listPrayerRequests,
  getPrayerRequest,
  markAsRead,
  updateStatus,
  deletePrayerRequest,
  countUnread
};
