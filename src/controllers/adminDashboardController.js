const supabase = require('../db');

// Helper function for error handling
function handleError(res, err, message = 'Server error') {
  console.error(message + ':', err);
  return res.status(500).json({ success: false, message });
}

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Execute all counts in parallel
    const [
      totalEventsResult,
      upcomingEventsResult,
      totalAnnouncementsResult,
      totalRSVPsResult,
      totalMembersResult,
      totalPrayerRequestsResult,
      unreadPrayerRequestsResult,
      totalContactsResult,
      unreadContactsResult
    ] = await Promise.all([
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }).gte('date', today),
      supabase.from('announcements').select('*', { count: 'exact', head: true }),
      supabase.from('event_rsvps').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('prayer_requests').select('*', { count: 'exact', head: true }),
      supabase.from('prayer_requests').select('*', { count: 'exact', head: true }).eq('is_read', false),
      supabase.from('contact').select('*', { count: 'exact', head: true }),
      supabase.from('contact').select('*', { count: 'exact', head: true }).eq('is_read', false)
    ]);

    const stats = {
      totalEvents: totalEventsResult.count || 0,
      upcomingEvents: upcomingEventsResult.count || 0,
      totalAnnouncements: totalAnnouncementsResult.count || 0,
      totalRSVPs: totalRSVPsResult.count || 0,
      totalMembers: totalMembersResult.count || 0,
      totalPrayerRequests: totalPrayerRequestsResult.count || 0,
      unreadPrayerRequests: unreadPrayerRequestsResult.count || 0,
      totalContacts: totalContactsResult.count || 0,
      unreadContacts: unreadContactsResult.count || 0
    };

    res.json({ success: true, stats });
  } catch (err) {
    return handleError(res, err, 'Error fetching dashboard stats');
  }
};
