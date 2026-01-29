const supabase = require('../db');

// Helper function for error handling
function handleError(res, err, message = 'Server error') {
  console.error(message + ':', err);
  return res.status(500).json({ success: false, message });
}

// List all announcements
exports.listAnnouncements = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) return handleError(res, error, 'Error fetching announcements');
    res.json({ success: true, data });
  } catch (err) {
    return handleError(res, err, 'Error fetching announcements');
  }
};

// Count announcements
exports.countAnnouncements = async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('announcements')
      .select('*', { count: 'exact', head: true });

    if (error) return handleError(res, error, 'Error counting announcements');
    res.json({ count: count || 0 });
  } catch (err) {
    return handleError(res, err, 'Error counting announcements');
  }
};

// Create new announcement
exports.createAnnouncement = async (req, res) => {
  const { title, content, priority, author, date } = req.body;
  
  if (!title || !content || !author || !date) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const { data, error } = await supabase
      .from('announcements')
      .insert([{
        title,
        content,
        priority: priority || 'general',
        author,
        date
      }])
      .select();

    if (error) return handleError(res, error, 'Error creating announcement');
    res.status(201).json({ success: true, message: 'Announcement created successfully', id: data[0]?.id });
  } catch (err) {
    return handleError(res, err, 'Error creating announcement');
  }
};

// Get single announcement
exports.getAnnouncement = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Announcement not found' });
      }
      return handleError(res, error, 'Error fetching announcement');
    }
    res.json({ success: true, data });
  } catch (err) {
    return handleError(res, err, 'Error fetching announcement');
  }
};

// Update announcement
exports.updateAnnouncement = async (req, res) => {
  const { title, content, priority, author, date } = req.body;
  
  if (!title || !content || !author || !date) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const { data, error } = await supabase
      .from('announcements')
      .update({
        title,
        content,
        priority: priority || 'general',
        author,
        date
      })
      .eq('id', req.params.id)
      .select();

    if (error) return handleError(res, error, 'Error updating announcement');
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    res.json({ success: true, message: 'Announcement updated successfully' });
  } catch (err) {
    return handleError(res, err, 'Error updating announcement');
  }
};

// Delete announcement
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', req.params.id)
      .select();

    if (error) return handleError(res, error, 'Error deleting announcement');
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (err) {
    return handleError(res, err, 'Error deleting announcement');
  }
};
