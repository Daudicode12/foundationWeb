const supabase = require('../db');

// Helper function for error handling
function handleError(res, err, message = 'Server error') {
  console.error(message + ':', err);
  return res.status(500).json({ success: false, message });
}

// List all offerings
exports.listOfferings = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('offerings')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) return handleError(res, error, 'Error fetching offerings');
    res.json({ success: true, data });
  } catch (err) {
    return handleError(res, err, 'Error fetching offerings');
  }
};

// Count offerings
exports.countOfferings = async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('offerings')
      .select('*', { count: 'exact', head: true });

    if (error) return handleError(res, error, 'Error counting offerings');
    res.json({ count: count || 0 });
  } catch (err) {
    return handleError(res, err, 'Error counting offerings');
  }
};

// Get total offerings amount
exports.getTotalAmount = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('offerings')
      .select('amount');

    if (error) return handleError(res, error, 'Error calculating total offerings');
    
    const total = data.reduce((sum, offering) => sum + parseFloat(offering.amount || 0), 0);
    res.json({ success: true, total });
  } catch (err) {
    return handleError(res, err, 'Error calculating total offerings');
  }
};

// Get offerings summary by type
exports.getOfferingsSummary = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('offerings')
      .select('offering_type, amount');

    if (error) return handleError(res, error, 'Error fetching offerings summary');
    
    // Group by offering_type manually
    const summary = data.reduce((acc, offering) => {
      const type = offering.offering_type;
      if (!acc[type]) {
        acc[type] = { offering_type: type, count: 0, total: 0 };
      }
      acc[type].count++;
      acc[type].total += parseFloat(offering.amount || 0);
      return acc;
    }, {});
    
    const result = Object.values(summary).sort((a, b) => b.total - a.total);
    res.json({ success: true, data: result });
  } catch (err) {
    return handleError(res, err, 'Error fetching offerings summary');
  }
};

// Get offerings by date range
exports.getOfferingsByDateRange = async (req, res) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ success: false, message: 'Start date and end date are required' });
  }

  try {
    const { data, error } = await supabase
      .from('offerings')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) return handleError(res, error, 'Error fetching offerings by date range');
    res.json({ success: true, data });
  } catch (err) {
    return handleError(res, err, 'Error fetching offerings by date range');
  }
};

// Create new offering
exports.createOffering = async (req, res) => {
  const { 
    member_name, 
    email, 
    phone, 
    amount, 
    offering_type, 
    payment_method, 
    reference_number, 
    date, 
    notes,
    is_anonymous 
  } = req.body;
  
  if (!member_name || !amount || !date) {
    return res.status(400).json({ success: false, message: 'Member name, amount, and date are required' });
  }

  try {
    const { data, error } = await supabase
      .from('offerings')
      .insert([{
        member_name,
        email: email || null,
        phone: phone || null,
        amount,
        offering_type: offering_type || 'offering',
        payment_method: payment_method || 'cash',
        reference_number: reference_number || null,
        date,
        notes: notes || null,
        is_anonymous: is_anonymous || false
      }])
      .select();

    if (error) return handleError(res, error, 'Error creating offering');
    res.status(201).json({ success: true, message: 'Offering recorded successfully', id: data[0]?.id });
  } catch (err) {
    return handleError(res, err, 'Error creating offering');
  }
};

// Get single offering
exports.getOffering = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('offerings')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Offering not found' });
      }
      return handleError(res, error, 'Error fetching offering');
    }
    res.json({ success: true, data });
  } catch (err) {
    return handleError(res, err, 'Error fetching offering');
  }
};

// Update offering
exports.updateOffering = async (req, res) => {
  const { 
    member_name, 
    email, 
    phone, 
    amount, 
    offering_type, 
    payment_method, 
    reference_number, 
    date, 
    notes,
    is_anonymous 
  } = req.body;
  
  if (!member_name || !amount || !date) {
    return res.status(400).json({ success: false, message: 'Member name, amount, and date are required' });
  }

  try {
    const { data, error } = await supabase
      .from('offerings')
      .update({
        member_name,
        email: email || null,
        phone: phone || null,
        amount,
        offering_type: offering_type || 'offering',
        payment_method: payment_method || 'cash',
        reference_number: reference_number || null,
        date,
        notes: notes || null,
        is_anonymous: is_anonymous || false
      })
      .eq('id', req.params.id)
      .select();

    if (error) return handleError(res, error, 'Error updating offering');
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Offering not found' });
    }
    res.json({ success: true, message: 'Offering updated successfully' });
  } catch (err) {
    return handleError(res, err, 'Error updating offering');
  }
};

// Delete offering
exports.deleteOffering = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('offerings')
      .delete()
      .eq('id', req.params.id)
      .select();

    if (error) return handleError(res, error, 'Error deleting offering');
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Offering not found' });
    }
    res.json({ success: true, message: 'Offering deleted successfully' });
  } catch (err) {
    return handleError(res, err, 'Error deleting offering');
  }
};

// Get monthly report
exports.getMonthlyReport = async (req, res) => {
  const { year, month } = req.params;
  
  try {
    // Calculate date range for the month
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('offerings')
      .select('date, offering_type, amount')
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) return handleError(res, error, 'Error fetching monthly report');
    
    // Group by date and offering_type
    const grouped = data.reduce((acc, offering) => {
      const key = `${offering.date}_${offering.offering_type}`;
      if (!acc[key]) {
        acc[key] = { offering_date: offering.date, offering_type: offering.offering_type, count: 0, total: 0 };
      }
      acc[key].count++;
      acc[key].total += parseFloat(offering.amount || 0);
      return acc;
    }, {});
    
    const result = Object.values(grouped).sort((a, b) => new Date(b.offering_date) - new Date(a.offering_date));
    res.json({ success: true, data: result });
  } catch (err) {
    return handleError(res, err, 'Error fetching monthly report');
  }
};
