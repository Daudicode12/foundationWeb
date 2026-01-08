const db = require('../db');

// List all sermons
const listSermons = (req, res) => {
  const sql = 'SELECT * FROM sermons ORDER BY date DESC, time DESC';
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error listing sermons:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch sermons' });
    }
    res.json({ success: true, data: results });
  });
};

// Get upcoming sermons
const getUpcomingSermons = (req, res) => {
  const sql = 'SELECT * FROM sermons WHERE date >= CURDATE() ORDER BY date ASC, time ASC LIMIT 10';
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching upcoming sermons:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch upcoming sermons' });
    }
    res.json({ success: true, data: results });
  });
};

// Get sermon by ID
const getSermon = (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM sermons WHERE id = ?';
  
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error fetching sermon:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch sermon' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Sermon not found' });
    }
    
    res.json({ success: true, data: results[0] });
  });
};

// Create new sermon
const createSermon = (req, res) => {
  const {
    title,
    preacher,
    description,
    scripture_reference,
    date,
    time,
    day_type,
    series_name,
    video_url,
    audio_url
  } = req.body;

  if (!title || !preacher || !date || !time) {
    return res.status(400).json({ 
      success: false, 
      message: 'Title, preacher, date, and time are required' 
    });
  }

  const sql = `INSERT INTO sermons (title, preacher, description, scripture_reference, date, time, day_type, series_name, video_url, audio_url, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
  
  db.query(sql, [title, preacher, description, scripture_reference, date, time, day_type || 'sunday', series_name, video_url, audio_url], (err, result) => {
    if (err) {
      console.error('Error creating sermon:', err);
      return res.status(500).json({ success: false, message: 'Failed to create sermon: ' + err.message });
    }

    res.status(201).json({ 
      success: true, 
      message: 'Sermon created successfully',
      data: { id: result.insertId }
    });
  });
};

// Update sermon
const updateSermon = (req, res) => {
  const { id } = req.params;
  const {
    title,
    preacher,
    description,
    scripture_reference,
    date,
    time,
    day_type,
    series_name,
    video_url,
    audio_url
  } = req.body;

  const sql = `UPDATE sermons SET 
      title = ?, 
      preacher = ?, 
      description = ?, 
      scripture_reference = ?,
      date = ?, 
      time = ?, 
      day_type = ?,
      series_name = ?,
      video_url = ?,
      audio_url = ?,
      updated_at = NOW()
     WHERE id = ?`;

  db.query(sql, [title, preacher, description, scripture_reference, date, time, day_type, series_name, video_url, audio_url, id], (err, result) => {
    if (err) {
      console.error('Error updating sermon:', err);
      return res.status(500).json({ success: false, message: 'Failed to update sermon' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Sermon not found' });
    }

    res.json({ success: true, message: 'Sermon updated successfully' });
  });
};

// Delete sermon
const deleteSermon = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM sermons WHERE id = ?';
  
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting sermon:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete sermon' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Sermon not found' });
    }

    res.json({ success: true, message: 'Sermon deleted successfully' });
  });
};

// Get sermons by day type
const getSermonsByDayType = (req, res) => {
  const { dayType } = req.params;
  const sql = 'SELECT * FROM sermons WHERE day_type = ? ORDER BY date DESC, time DESC';
  
  db.query(sql, [dayType], (err, results) => {
    if (err) {
      console.error('Error fetching sermons by day type:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch sermons' });
    }
    res.json({ success: true, data: results });
  });
};

module.exports = {
  listSermons,
  getUpcomingSermons,
  getSermon,
  createSermon,
  updateSermon,
  deleteSermon,
  getSermonsByDayType
};
