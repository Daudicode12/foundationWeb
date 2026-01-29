const supabase = require('../db');

// Helper function for error handling
function handleError(res, err, message = 'Server error') {
  console.error(message + ':', err);
  return res.status(500).json({ success: false, message });
}

// Create a new offering (member submission)
exports.createOffering = async (req, res) => {
  const { member_name, email, phone, amount, offering_type, payment_method, reference_number, date, notes, is_anonymous } = req.body;

  // Validation
  if (!member_name || !amount || !offering_type || !date) {
    return res.status(400).json({ 
      success: false, 
      message: 'Member name, amount, offering type, and date are required' 
    });
  }

  if (!email && !phone) {
    return res.status(400).json({ 
      success: false, 
      message: 'Either email or phone number is required' 
    });
  }

  try {
    const { data, error } = await supabase
      .from('offerings')
      .insert([{
        member_name,
        email: email || null,
        phone: phone || null,
        amount,
        offering_type,
        payment_method: payment_method || 'cash',
        reference_number: reference_number || null,
        date,
        notes: notes || null,
        is_anonymous: is_anonymous || false
      }])
      .select();

    if (error) return handleError(res, error, 'Error creating offering');
    res.status(201).json({ 
      success: true, 
      message: 'Offering recorded successfully',
      offeringId: data[0]?.id 
    });
  } catch (err) {
    return handleError(res, err, 'Error creating offering');
  }
};

// Get user's offerings by email
exports.getMyOfferings = async (req, res) => {
  const { email } = req.query;
  
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    const { data, error } = await supabase
      .from('offerings')
      .select('*')
      .eq('email', email)
      .eq('is_anonymous', false)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) return handleError(res, error, 'Error fetching your offerings');
    res.json({ success: true, data });
  } catch (err) {
    return handleError(res, err, 'Error fetching your offerings');
  }
};

// Get user's offerings by phone
exports.getMyOfferingsByPhone = async (req, res) => {
  const { phone } = req.query;
  
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Phone number is required' });
  }

  try {
    const { data, error } = await supabase
      .from('offerings')
      .select('*')
      .eq('phone', phone)
      .eq('is_anonymous', false)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) return handleError(res, error, 'Error fetching your offerings');
    res.json({ success: true, data });
  } catch (err) {
    return handleError(res, err, 'Error fetching your offerings');
  }
};

// Get user's total offerings
exports.getMyOfferingsTotal = async (req, res) => {
  const { email } = req.query;
  
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    const { data, error } = await supabase
      .from('offerings')
      .select('amount')
      .eq('email', email)
      .eq('is_anonymous', false);

    if (error) return handleError(res, error, 'Error calculating your total offerings');
    
    const total = data.reduce((sum, offering) => sum + parseFloat(offering.amount || 0), 0);
    const count = data.length;
    
    res.json({ 
      success: true, 
      total,
      count
    });
  } catch (err) {
    return handleError(res, err, 'Error calculating your total offerings');
  }
};

// Get user's offerings summary by type
exports.getMyOfferingsSummary = async (req, res) => {
  const { email } = req.query;
  
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    const { data, error } = await supabase
      .from('offerings')
      .select('offering_type, amount')
      .eq('email', email)
      .eq('is_anonymous', false);

    if (error) return handleError(res, error, 'Error fetching your offerings summary');
    
    // Group by offering_type manually
    const summary = data.reduce((acc, offering) => {
      const type = offering.offering_type;
      if (!acc[type]) {
        acc[type] = { offering_type: type, total: 0, count: 0 };
      }
      acc[type].total += parseFloat(offering.amount || 0);
      acc[type].count++;
      return acc;
    }, {});
    
    const result = Object.values(summary).sort((a, b) => b.total - a.total);
    res.json({ success: true, data: result });
  } catch (err) {
    return handleError(res, err, 'Error fetching your offerings summary');
  }
};
