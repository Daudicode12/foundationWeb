const supabase = require('../db');

// Get all events
const getAllEvents = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false })
      .order('time', { ascending: false });

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

// Get upcoming events
const getUpcomingEvents = async (req, res) => {
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

// Get past events
const getPastEvents = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .lt('date', today)
      .order('date', { ascending: false })
      .order('time', { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching past events:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
    res.json({ success: true, events: data });
  } catch (err) {
    console.error("Error fetching past events:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get single event
const getEventById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching event:", error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: "Event not found" });
      }
      return res.status(500).json({ success: false, message: "Server error" });
    }
    res.json(data);
  } catch (err) {
    console.error("Error fetching event:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// RSVP for event
const rsvpEvent = async (req, res) => {
  const { eventId, email, userName } = req.body;

  if (!eventId || !email) {
    return res.status(400).json({ success: false, message: "Event ID and email are required" });
  }

  try {
    // Check if already registered
    const { data: existing, error: checkError } = await supabase
      .from('event_rsvps')
      .select('*')
      .eq('eventid', eventId)
      .eq('email', email);

    if (checkError) {
      console.error("Error checking RSVP:", checkError);
      return res.status(500).json({ success: false, message: "Server error" });
    }

    if (existing && existing.length > 0) {
      return res.status(400).json({ success: false, message: "Already registered for this event" });
    }

    // Insert RSVP
    const { error: insertError } = await supabase
      .from('event_rsvps')
      .insert([{
        eventid: eventId,
        email,
        username: userName,
        rsvp_date: new Date().toISOString()
      }]);

    if (insertError) {
      console.error("Error creating RSVP:", insertError);
      return res.status(500).json({ success: false, message: "Server error" });
    }

    // Update attendee count
    const { data: event } = await supabase
      .from('events')
      .select('attendees')
      .eq('id', eventId)
      .single();

    if (event) {
      await supabase
        .from('events')
        .update({ attendees: (event.attendees || 0) + 1 })
        .eq('id', eventId);
    }

    res.json({ success: true, message: "RSVP successful" });
  } catch (err) {
    console.error("Error in RSVP:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Cancel RSVP
const cancelRsvp = async (req, res) => {
  const { eventId, email } = req.body;

  if (!eventId || !email) {
    return res.status(400).json({ success: false, message: "Event ID and email are required" });
  }

  try {
    const { data, error } = await supabase
      .from('event_rsvps')
      .delete()
      .eq('eventid', eventId)
      .eq('email', email)
      .select();

    if (error) {
      console.error("Error cancelling RSVP:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: "RSVP not found" });
    }

    // Update attendee count
    const { data: event } = await supabase
      .from('events')
      .select('attendees')
      .eq('id', eventId)
      .single();

    if (event) {
      await supabase
        .from('events')
        .update({ attendees: Math.max((event.attendees || 0) - 1, 0) })
        .eq('id', eventId);
    }

    res.json({ success: true, message: "RSVP cancelled" });
  } catch (err) {
    console.error("Error cancelling RSVP:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getAllEvents,
  getUpcomingEvents,
  getPastEvents,
  getEventById,
  rsvpEvent,
  cancelRsvp
};
