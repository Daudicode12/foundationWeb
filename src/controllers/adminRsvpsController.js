const supabase = require('../db');

// Helper function for error handling
function handleError(res, err, message = 'Server error') {
  console.error(message + ':', err);
  return res.status(500).json({ success: false, message });
}

// List all RSVPs with event details
exports.listRSVPs = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('event_rsvps')
      .select(`
        eventid,
        email,
        username,
        rsvp_date,
        events (
          title,
          date,
          time
        )
      `)
      .order('rsvp_date', { ascending: false });

    if (error) return handleError(res, error, 'Error fetching RSVPs');
    
    // Transform data to match expected format
    const rsvps = data.map(rsvp => ({
      eventId: rsvp.eventid,
      email: rsvp.email,
      userName: rsvp.username,
      rsvp_date: rsvp.rsvp_date,
      eventTitle: rsvp.events?.title,
      eventDate: rsvp.events?.date,
      eventTime: rsvp.events?.time
    }));
    
    res.json({ success: true, data: rsvps });
  } catch (err) {
    return handleError(res, err, 'Error fetching RSVPs');
  }
};

// Count RSVPs
exports.countRSVPs = async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('event_rsvps')
      .select('*', { count: 'exact', head: true });

    if (error) return handleError(res, error, 'Error counting RSVPs');
    res.json({ count: count || 0 });
  } catch (err) {
    return handleError(res, err, 'Error counting RSVPs');
  }
};

// Get RSVPs for a specific event
exports.getEventRSVPs = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('event_rsvps')
      .select('eventid, email, username, rsvp_date')
      .eq('eventid', req.params.eventId)
      .order('rsvp_date', { ascending: false });

    if (error) return handleError(res, error, 'Error fetching event RSVPs');
    
    // Transform data to match expected format
    const rsvps = data.map(rsvp => ({
      eventId: rsvp.eventid,
      email: rsvp.email,
      userName: rsvp.username,
      rsvp_date: rsvp.rsvp_date
    }));
    
    res.json({ success: true, data: rsvps });
  } catch (err) {
    return handleError(res, err, 'Error fetching event RSVPs');
  }
};
