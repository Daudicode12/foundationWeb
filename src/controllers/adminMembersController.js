const supabase = require('../db');

// Helper function for error handling
function handleError(res, err, message = 'Server error') {
  console.error(message + ':', err);
  return res.status(500).json({ success: false, message });
}

// List all members
exports.listMembers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, phone, created_at, role')
      .order('created_at', { ascending: false });

    if (error) return handleError(res, error, 'Error fetching members');
    
    // Transform data to match expected format
    const members = data.map(user => ({
      id: user.id,
      name: user.username,
      email: user.email,
      phone: user.phone,
      created_at: user.created_at,
      role: user.role
    }));
    
    res.json({ success: true, data: members });
  } catch (err) {
    return handleError(res, err, 'Error fetching members');
  }
};

// Count members
exports.countMembers = async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) return handleError(res, error, 'Error counting members');
    res.json({ count: count || 0 });
  } catch (err) {
    return handleError(res, err, 'Error counting members');
  }
};

// Get single member
exports.getMember = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, phone, created_at, role')
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Member not found' });
      }
      return handleError(res, error, 'Error fetching member');
    }

    const member = {
      id: data.id,
      name: data.username,
      email: data.email,
      phone: data.phone,
      created_at: data.created_at,
      role: data.role
    };

    res.json({ success: true, data: member });
  } catch (err) {
    return handleError(res, err, 'Error fetching member');
  }
};

// Update member role
exports.updateMemberRole = async (req, res) => {
  const { role } = req.body;
  
  if (!role || !['member', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', req.params.id)
      .select();

    if (error) return handleError(res, error, 'Error updating member role');
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    res.json({ success: true, message: 'Member role updated successfully' });
  } catch (err) {
    return handleError(res, err, 'Error updating member role');
  }
};

// Delete member
exports.deleteMember = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id)
      .select();

    if (error) return handleError(res, error, 'Error deleting member');
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    res.json({ success: true, message: 'Member deleted successfully' });
  } catch (err) {
    return handleError(res, err, 'Error deleting member');
  }
};
