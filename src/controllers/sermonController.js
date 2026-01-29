const supabase = require('../db');

// List all sermons
const listSermons = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .order('date', { ascending: false })
      .order('time', { ascending: false });

    if (error) {
      console.error('Error listing sermons:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch sermons' });
    }
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error listing sermons:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch sermons' });
  }
};

// Get upcoming sermons
const getUpcomingSermons = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .gte('date', today)
      .order('date', { ascending: true })
      .order('time', { ascending: true })
      .limit(10);

    if (error) {
      console.error('Error fetching upcoming sermons:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch upcoming sermons' });
    }
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching upcoming sermons:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch upcoming sermons' });
  }
};

// Get sermon by ID
const getSermon = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching sermon:', error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Sermon not found' });
      }
      return res.status(500).json({ success: false, message: 'Failed to fetch sermon' });
    }
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching sermon:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch sermon' });
  }
};

// Create new sermon
const createSermon = async (req, res) => {
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

  try {
    const { data, error } = await supabase
      .from('sermons')
      .insert([{
        title,
        preacher,
        description,
        scripture_reference,
        date,
        time,
        day_type: day_type || 'sunday',
        series_name,
        video_url,
        audio_url
      }])
      .select();

    if (error) {
      console.error('Error creating sermon:', error);
      return res.status(500).json({ success: false, message: 'Failed to create sermon: ' + error.message });
    }

    res.status(201).json({ 
      success: true, 
      message: 'Sermon created successfully',
      data: { id: data[0]?.id }
    });
  } catch (err) {
    console.error('Error creating sermon:', err);
    return res.status(500).json({ success: false, message: 'Failed to create sermon' });
  }
};

// Update sermon
const updateSermon = async (req, res) => {
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

  try {
    const { data, error } = await supabase
      .from('sermons')
      .update({
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
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating sermon:', error);
      return res.status(500).json({ success: false, message: 'Failed to update sermon' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Sermon not found' });
    }

    res.json({ success: true, message: 'Sermon updated successfully' });
  } catch (err) {
    console.error('Error updating sermon:', err);
    return res.status(500).json({ success: false, message: 'Failed to update sermon' });
  }
};

// Delete sermon
const deleteSermon = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('sermons')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error deleting sermon:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete sermon' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Sermon not found' });
    }

    res.json({ success: true, message: 'Sermon deleted successfully' });
  } catch (err) {
    console.error('Error deleting sermon:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete sermon' });
  }
};

// Get sermons by day type
const getSermonsByDayType = async (req, res) => {
  const { dayType } = req.params;

  try {
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .eq('day_type', dayType)
      .order('date', { ascending: false })
      .order('time', { ascending: false });

    if (error) {
      console.error('Error fetching sermons by day type:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch sermons' });
    }
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching sermons by day type:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch sermons' });
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
