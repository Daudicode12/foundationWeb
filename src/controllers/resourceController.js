const supabase = require('../db');

// Get all resources (public - for members)
const getPublicResources = async (req, res) => {
  const { category, featured } = req.query;

  try {
    let query = supabase
      .from('resources')
      .select('*')
      .eq('is_active', true);

    if (category) {
      query = query.eq('category', category);
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query
      .order('date_shared', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching resources:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.json({ success: true, resources: data });
  } catch (err) {
    console.error('Error fetching resources:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get single resource (public)
const getPublicResource = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching resource:', error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Resource not found' });
      }
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.json({ success: true, resource: data });
  } catch (err) {
    console.error('Error fetching resource:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all resources (admin)
const listResources = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching resources:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.json({ success: true, resources: data });
  } catch (err) {
    console.error('Error fetching resources:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get single resource (admin)
const getResource = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching resource:', error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Resource not found' });
      }
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.json({ success: true, resource: data });
  } catch (err) {
    console.error('Error fetching resource:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create resource (admin)
const createResource = async (req, res) => {
  const { title, category, scripture_reference, content, author, date_shared, tags, is_featured } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required' });
  }

  try {
    const { data, error } = await supabase
      .from('resources')
      .insert([{
        title,
        category: category || 'bible_verse',
        scripture_reference: scripture_reference || null,
        content,
        author: author || null,
        date_shared: date_shared || new Date().toISOString().split('T')[0],
        tags: tags || null,
        is_featured: is_featured || false
      }])
      .select();

    if (error) {
      console.error('Error creating resource:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.json({ 
      success: true, 
      message: 'Resource created successfully',
      resourceId: data[0]?.id 
    });
  } catch (err) {
    console.error('Error creating resource:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update resource (admin)
const updateResource = async (req, res) => {
  const { id } = req.params;
  const { title, category, scripture_reference, content, author, date_shared, tags, is_featured, is_active } = req.body;

  try {
    const { data, error } = await supabase
      .from('resources')
      .update({
        title,
        category,
        scripture_reference,
        content,
        author,
        date_shared,
        tags,
        is_featured,
        is_active
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating resource:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    res.json({ success: true, message: 'Resource updated successfully' });
  } catch (err) {
    console.error('Error updating resource:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete resource (admin)
const deleteResource = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('resources')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error deleting resource:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    res.json({ success: true, message: 'Resource deleted successfully' });
  } catch (err) {
    console.error('Error deleting resource:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Count resources (admin)
const countResources = async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('resources')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error counting resources:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.json({ success: true, count: count || 0 });
  } catch (err) {
    console.error('Error counting resources:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Toggle featured status (admin)
const toggleFeatured = async (req, res) => {
  const { id } = req.params;

  try {
    // First get the current status
    const { data: current, error: fetchError } = await supabase
      .from('resources')
      .select('is_featured')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Resource not found' });
      }
      console.error('Error fetching resource:', fetchError);
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    // Toggle the status
    const { data, error } = await supabase
      .from('resources')
      .update({ is_featured: !current.is_featured })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error toggling featured status:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.json({ success: true, message: 'Featured status updated' });
  } catch (err) {
    console.error('Error toggling featured status:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
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
