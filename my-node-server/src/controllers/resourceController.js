const db = require('../db');

// Get all resources (public - for members)
const getPublicResources = (req, res) => {
  const { category, featured } = req.query;
  let sql = 'SELECT * FROM resources WHERE is_active = TRUE';
  const params = [];

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }

  if (featured === 'true') {
    sql += ' AND is_featured = TRUE';
  }

  sql += ' ORDER BY date_shared DESC, created_at DESC';

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching resources:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.json({ success: true, resources: results });
  });
};

// Get single resource (public)
const getPublicResource = (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM resources WHERE id = ? AND is_active = TRUE';
  
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error fetching resource:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    res.json({ success: true, resource: results[0] });
  });
};

// Get all resources (admin)
const listResources = (req, res) => {
  const sql = 'SELECT * FROM resources ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching resources:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.json({ success: true, resources: results });
  });
};

// Get single resource (admin)
const getResource = (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM resources WHERE id = ?';
  
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error fetching resource:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    res.json({ success: true, resource: results[0] });
  });
};

// Create resource (admin)
const createResource = (req, res) => {
  const { title, category, scripture_reference, content, author, date_shared, tags, is_featured } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required' });
  }

  const sql = `INSERT INTO resources (title, category, scripture_reference, content, author, date_shared, tags, is_featured) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.query(sql, [
    title,
    category || 'bible_verse',
    scripture_reference || null,
    content,
    author || null,
    date_shared || new Date().toISOString().split('T')[0],
    tags || null,
    is_featured || false
  ], (err, result) => {
    if (err) {
      console.error('Error creating resource:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.json({ 
      success: true, 
      message: 'Resource created successfully',
      resourceId: result.insertId 
    });
  });
};

// Update resource (admin)
const updateResource = (req, res) => {
  const { id } = req.params;
  const { title, category, scripture_reference, content, author, date_shared, tags, is_featured, is_active } = req.body;

  const sql = `UPDATE resources SET 
               title = ?, category = ?, scripture_reference = ?, content = ?, 
               author = ?, date_shared = ?, tags = ?, is_featured = ?, is_active = ?
               WHERE id = ?`;
  
  db.query(sql, [
    title, category, scripture_reference, content, 
    author, date_shared, tags, is_featured, is_active, id
  ], (err, result) => {
    if (err) {
      console.error('Error updating resource:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    res.json({ success: true, message: 'Resource updated successfully' });
  });
};

// Delete resource (admin)
const deleteResource = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM resources WHERE id = ?';
  
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting resource:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    res.json({ success: true, message: 'Resource deleted successfully' });
  });
};

// Count resources (admin)
const countResources = (req, res) => {
  const sql = 'SELECT COUNT(*) as count FROM resources';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error counting resources:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.json({ success: true, count: results[0].count });
  });
};

// Toggle featured status (admin)
const toggleFeatured = (req, res) => {
  const { id } = req.params;
  const sql = 'UPDATE resources SET is_featured = NOT is_featured WHERE id = ?';
  
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error toggling featured status:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    res.json({ success: true, message: 'Featured status updated' });
  });
};

module.exports = {
  getPublicResources,
  getPublicResource,
  listResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  countResources,
  toggleFeatured
};
