const supabase = require('../db');

// Submit contact message (public)
const submitContact = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: "All required fields must be filled" });
  }

  console.log("Contact form submission:", { name, email, phone, subject, message });

  try {
    const { data, error } = await supabase
      .from('contact')
      .insert([{ name, email, phone: phone || null, subject, message }])
      .select();

    if (error) {
      console.error("Error saving contact message:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to save your message. Please try again later."
      });
    }

    res.json({
      success: true,
      message: "Thank you for contacting us! We will get back to you soon.",
      contactId: data[0]?.id
    });
  } catch (err) {
    console.error("Error saving contact message:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to save your message. Please try again later."
    });
  }
};

// Get all contact messages (admin)
const listContacts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contact')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contact messages:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.json({ success: true, contacts: data });
  } catch (err) {
    console.error('Error fetching contact messages:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get single contact message (admin)
const getContact = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('contact')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching contact message:', error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Contact message not found' });
      }
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.json({ success: true, contact: data });
  } catch (err) {
    console.error('Error fetching contact message:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Mark contact message as read (admin)
const markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('contact')
      .update({ is_read: true })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating contact message:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Contact message not found' });
    }
    res.json({ success: true, message: 'Message marked as read' });
  } catch (err) {
    console.error('Error updating contact message:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete contact message (admin)
const deleteContact = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('contact')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error deleting contact message:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Contact message not found' });
    }
    res.json({ success: true, message: 'Contact message deleted successfully' });
  } catch (err) {
    console.error('Error deleting contact message:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Count unread messages (admin)
const countUnread = async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('contact')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    if (error) {
      console.error('Error counting unread messages:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.json({ success: true, count: count || 0 });
  } catch (err) {
    console.error('Error counting unread messages:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  submitContact,
  listContacts,
  getContact,
  markAsRead,
  deleteContact,
  countUnread
};
