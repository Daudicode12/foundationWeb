const pool = require('../db');

// List all sermons
const listSermons = async (req, res) => {
  try {
    const [sermons] = await pool.query(
      'SELECT * FROM sermons ORDER BY date DESC, time DESC'
    );
    res.json({ success: true, data: sermons });
  } catch (error) {
    console.error('Error listing sermons:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sermons' });
  }
};

// Get upcoming sermons
const getUpcomingSermons = async (req, res) => {
  try {
    const [sermons] = await pool.query(
      'SELECT * FROM sermons WHERE date >= CURDATE() ORDER BY date ASC, time ASC LIMIT 10'
    );
    res.json({ success: true, data: sermons });
  } catch (error) {
    console.error('Error fetching upcoming sermons:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch upcoming sermons' });
  }
};

// Get sermon by ID
const getSermon = async (req, res) => {
  try {
    const { id } = req.params;
    const [sermons] = await pool.query('SELECT * FROM sermons WHERE id = ?', [id]);
    
    if (sermons.length === 0) {
      return res.status(404).json({ success: false, message: 'Sermon not found' });
    }
    
    res.json({ success: true, data: sermons[0] });
  } catch (error) {
    console.error('Error fetching sermon:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sermon' });
  }
};

// Create new sermon
const createSermon = async (req, res) => {
  try {
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

    const [result] = await pool.query(
      `INSERT INTO sermons (title, preacher, description, scripture_reference, date, time, day_type, series_name, video_url, audio_url, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [title, preacher, description, scripture_reference, date, time, day_type || 'sunday', series_name, video_url, audio_url]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Sermon created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating sermon:', error);
    res.status(500).json({ success: false, message: 'Failed to create sermon' });
  }
};

// Update sermon
const updateSermon = async (req, res) => {
  try {
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

    const [result] = await pool.query(
      `UPDATE sermons SET 
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
       WHERE id = ?`,
      [title, preacher, description, scripture_reference, date, time, day_type, series_name, video_url, audio_url, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Sermon not found' });
    }

    res.json({ success: true, message: 'Sermon updated successfully' });
  } catch (error) {
    console.error('Error updating sermon:', error);
    res.status(500).json({ success: false, message: 'Failed to update sermon' });
  }
};

// Delete sermon
const deleteSermon = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query('DELETE FROM sermons WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Sermon not found' });
    }

    res.json({ success: true, message: 'Sermon deleted successfully' });
  } catch (error) {
    console.error('Error deleting sermon:', error);
    res.status(500).json({ success: false, message: 'Failed to delete sermon' });
  }
};

// Get sermons by day type
const getSermonsByDayType = async (req, res) => {
  try {
    const { dayType } = req.params;
    const [sermons] = await pool.query(
      'SELECT * FROM sermons WHERE day_type = ? ORDER BY date DESC, time DESC',
      [dayType]
    );
    res.json({ success: true, data: sermons });
  } catch (error) {
    console.error('Error fetching sermons by day type:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sermons' });
  }
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
