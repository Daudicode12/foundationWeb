const supabase = require('../db');

// Helper function for error handling
function handleError(res, err, message = 'Server error') {
  console.error(message + ':', err);
  return res.status(500).json({ success: false, message });
}

// List all events
exports.listEvents = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) return handleError(res, error, 'Error fetching events');
    res.json({ success: true, data });
  } catch (err) {
    return handleError(res, err, 'Error fetching events');
  }
};

// Count events
exports.countEvents = async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });

    if (error) return handleError(res, error, 'Error counting events');
    res.json({ count: count || 0 });
  } catch (err) {
    return handleError(res, err, 'Error counting events');
  }
};

// Create new event
exports.createEvent = async (req, res) => {
  const { title, description, additionalInfo, category, date, time, location, image } = req.body;
  
  if (!title || !description || !category || !date || !time || !location) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .insert([{
        title,
        description,
        additionalinfo: additionalInfo || null,
        category,
        date,
        time,
        location,
        image: image || null,
        attendees: 0
      }])
      .select();

    if (error) return handleError(res, error, 'Error creating event');
    res.status(201).json({ success: true, message: 'Event created successfully', id: data[0]?.id });
  } catch (err) {
    return handleError(res, err, 'Error creating event');
  }
};

// Get single event
exports.getEvent = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }
      return handleError(res, error, 'Error fetching event');
    }
    res.json({ success: true, data });
  } catch (err) {
    return handleError(res, err, 'Error fetching event');
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  const { title, description, additionalInfo, category, date, time, location, image } = req.body;

  try {
    const { data, error } = await supabase
      .from('events')
      .update({
        title,
        description,
        additionalinfo: additionalInfo,
        category,
        date,
        time,
        location,
        image
      })
      .eq('id', req.params.id)
      .select();

    if (error) return handleError(res, error, 'Error updating event');
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, message: 'Event updated successfully' });
  } catch (err) {
    return handleError(res, err, 'Error updating event');
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .delete()
      .eq('id', req.params.id)
      .select();

    if (error) return handleError(res, error, 'Error deleting event');
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (err) {
    return handleError(res, err, 'Error deleting event');
  }
};
