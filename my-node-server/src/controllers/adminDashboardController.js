const db = require('../db');

// Helper function for error handling
function handleError(res, err, message = 'Server error') {
  console.error(message + ':', err);
  return res.status(500).json({ success: false, message });
}

// Get dashboard statistics
exports.getDashboardStats = (req, res) => {
  const queries = {
    totalEvents: 'SELECT COUNT(*) as count FROM events',
    upcomingEvents: 'SELECT COUNT(*) as count FROM events WHERE date >= CURDATE()',
    totalAnnouncements: 'SELECT COUNT(*) as count FROM announcements',
    totalRSVPs: 'SELECT COUNT(*) as count FROM event_rsvps',
    totalMembers: 'SELECT COUNT(*) as count FROM users',
    totalPrayerRequests: 'SELECT COUNT(*) as count FROM prayer_requests',
    unreadPrayerRequests: "SELECT COUNT(*) as count FROM prayer_requests WHERE is_read = 0",
    totalContacts: 'SELECT COUNT(*) as count FROM contacts',
    unreadContacts: 'SELECT COUNT(*) as count FROM contacts WHERE is_read = 0'
  };

  let stats = {};
  let completed = 0;
  const total = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, sql]) => {
    db.query(sql, (err, results) => {
      if (!err && results.length > 0) {
        stats[key] = results[0].count;
      } else {
        stats[key] = 0;
      }
      completed++;
      
      if (completed === total) {
        res.json({ success: true, stats });
      }
    });
  });
};
