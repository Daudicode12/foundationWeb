const supabase = require('../db');

// Helper function for error handling
function handleError(res, err, message = 'Server error') {
  console.error(message + ':', err);
  return res.status(500).json({ success: false, message });
}

// ============================================
// CHURCH MANAGEMENT
// ============================================

// List all churches
exports.listChurches = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('churches')
      .select('*')
      .order('name', { ascending: true });

    if (error) return handleError(res, error, 'Error fetching churches');
    res.json({ success: true, data });
  } catch (err) {
    return handleError(res, err, 'Error fetching churches');
  }
};

// List active churches only
exports.listActiveChurches = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('churches')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) return handleError(res, error, 'Error fetching churches');
    res.json({ success: true, data });
  } catch (err) {
    return handleError(res, err, 'Error fetching churches');
  }
};

// Count churches
exports.countChurches = async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('churches')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (error) return handleError(res, error, 'Error counting churches');
    res.json({ success: true, count: count || 0 });
  } catch (err) {
    return handleError(res, err, 'Error counting churches');
  }
};

// Get single church
exports.getChurch = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('churches')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Church not found' });
      }
      return handleError(res, error, 'Error fetching church');
    }

    res.json({ success: true, data });
  } catch (err) {
    return handleError(res, err, 'Error fetching church');
  }
};

// Create new church
exports.createChurch = async (req, res) => {
  const { name, code, address, city, region, phone, email, pastor_name } = req.body;

  if (!name || !code) {
    return res.status(400).json({ success: false, message: 'Church name and code are required' });
  }

  try {
    // Check if code already exists
    const { data: existing } = await supabase
      .from('churches')
      .select('id')
      .eq('code', code)
      .single();

    if (existing) {
      return res.status(400).json({ success: false, message: 'Church code already exists' });
    }

    const { data, error } = await supabase
      .from('churches')
      .insert([{
        name,
        code,
        address: address || null,
        city: city || null,
        region: region || null,
        phone: phone || null,
        email: email || null,
        pastor_name: pastor_name || null,
        is_active: true
      }])
      .select();

    if (error) return handleError(res, error, 'Error creating church');
    res.status(201).json({ success: true, message: 'Church created successfully', data: data[0] });
  } catch (err) {
    return handleError(res, err, 'Error creating church');
  }
};

// Update church
exports.updateChurch = async (req, res) => {
  const { name, code, address, city, region, phone, email, pastor_name, is_active } = req.body;

  try {
    // Check if code already exists for another church
    if (code) {
      const { data: existing } = await supabase
        .from('churches')
        .select('id')
        .eq('code', code)
        .neq('id', req.params.id)
        .single();

      if (existing) {
        return res.status(400).json({ success: false, message: 'Church code already exists' });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (region !== undefined) updateData.region = region;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (pastor_name !== undefined) updateData.pastor_name = pastor_name;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabase
      .from('churches')
      .update(updateData)
      .eq('id', req.params.id)
      .select();

    if (error) return handleError(res, error, 'Error updating church');
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Church not found' });
    }
    res.json({ success: true, message: 'Church updated successfully', data: data[0] });
  } catch (err) {
    return handleError(res, err, 'Error updating church');
  }
};

// Delete church
exports.deleteChurch = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('churches')
      .delete()
      .eq('id', req.params.id)
      .select();

    if (error) return handleError(res, error, 'Error deleting church');
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Church not found' });
    }
    res.json({ success: true, message: 'Church deleted successfully' });
  } catch (err) {
    return handleError(res, err, 'Error deleting church');
  }
};

// ============================================
// CONTRIBUTION TARGETS
// ============================================

// Set contribution target for a church
exports.setContributionTarget = async (req, res) => {
  const { church_id, year, target_amount, description } = req.body;

  if (!church_id || !year || !target_amount) {
    return res.status(400).json({ 
      success: false, 
      message: 'Church ID, year, and target amount are required' 
    });
  }

  try {
    // Upsert - insert or update if exists
    const { data, error } = await supabase
      .from('church_contribution_targets')
      .upsert({
        church_id,
        year,
        target_amount,
        description: description || null,
        created_by: req.adminId
      }, {
        onConflict: 'church_id,year'
      })
      .select();

    if (error) return handleError(res, error, 'Error setting contribution target');
    res.json({ success: true, message: 'Contribution target set successfully', data: data[0] });
  } catch (err) {
    return handleError(res, err, 'Error setting contribution target');
  }
};

// Get all targets for a year
exports.getTargetsByYear = async (req, res) => {
  const { year } = req.params;

  try {
    const { data, error } = await supabase
      .from('church_contribution_targets')
      .select(`
        *,
        churches (id, name, code, city, region, pastor_name)
      `)
      .eq('year', year)
      .order('created_at', { ascending: false });

    if (error) return handleError(res, error, 'Error fetching targets');
    res.json({ success: true, data });
  } catch (err) {
    return handleError(res, err, 'Error fetching targets');
  }
};

// Get target for a specific church
exports.getChurchTarget = async (req, res) => {
  const { churchId, year } = req.params;

  try {
    const { data, error } = await supabase
      .from('church_contribution_targets')
      .select('*')
      .eq('church_id', churchId)
      .eq('year', year)
      .single();

    if (error && error.code !== 'PGRST116') {
      return handleError(res, error, 'Error fetching target');
    }

    res.json({ success: true, data: data || null });
  } catch (err) {
    return handleError(res, err, 'Error fetching target');
  }
};

// Delete contribution target
exports.deleteTarget = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('church_contribution_targets')
      .delete()
      .eq('id', req.params.id)
      .select();

    if (error) return handleError(res, error, 'Error deleting target');
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Target not found' });
    }
    res.json({ success: true, message: 'Target deleted successfully' });
  } catch (err) {
    return handleError(res, err, 'Error deleting target');
  }
};

// ============================================
// CONTRIBUTIONS TRACKING
// ============================================

// Record a contribution
exports.recordContribution = async (req, res) => {
  const { 
    church_id, 
    amount, 
    contribution_date, 
    payment_method, 
    reference_number, 
    description, 
    receipt_number,
    notes 
  } = req.body;

  if (!church_id || !amount || !contribution_date) {
    return res.status(400).json({ 
      success: false, 
      message: 'Church ID, amount, and contribution date are required' 
    });
  }

  try {
    const { data, error } = await supabase
      .from('church_contributions')
      .insert([{
        church_id,
        amount,
        contribution_date,
        payment_method: payment_method || 'cash',
        reference_number: reference_number || null,
        description: description || null,
        recorded_by: req.adminId,
        receipt_number: receipt_number || null,
        notes: notes || null
      }])
      .select();

    if (error) return handleError(res, error, 'Error recording contribution');
    res.status(201).json({ success: true, message: 'Contribution recorded successfully', data: data[0] });
  } catch (err) {
    return handleError(res, err, 'Error recording contribution');
  }
};

// List all contributions
exports.listContributions = async (req, res) => {
  const { church_id, year, startDate, endDate } = req.query;

  try {
    let query = supabase
      .from('church_contributions')
      .select(`
        *,
        churches (id, name, code)
      `)
      .order('contribution_date', { ascending: false });

    if (church_id) {
      query = query.eq('church_id', church_id);
    }

    if (year) {
      query = query.gte('contribution_date', `${year}-01-01`)
                   .lte('contribution_date', `${year}-12-31`);
    }

    if (startDate && endDate) {
      query = query.gte('contribution_date', startDate)
                   .lte('contribution_date', endDate);
    }

    const { data, error } = await query;

    if (error) return handleError(res, error, 'Error fetching contributions');
    res.json({ success: true, data });
  } catch (err) {
    return handleError(res, err, 'Error fetching contributions');
  }
};

// Get single contribution
exports.getContribution = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('church_contributions')
      .select(`
        *,
        churches (id, name, code)
      `)
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Contribution not found' });
      }
      return handleError(res, error, 'Error fetching contribution');
    }

    res.json({ success: true, data });
  } catch (err) {
    return handleError(res, err, 'Error fetching contribution');
  }
};

// Update contribution
exports.updateContribution = async (req, res) => {
  const { amount, contribution_date, payment_method, reference_number, description, receipt_number, notes } = req.body;

  try {
    const updateData = {};
    if (amount !== undefined) updateData.amount = amount;
    if (contribution_date !== undefined) updateData.contribution_date = contribution_date;
    if (payment_method !== undefined) updateData.payment_method = payment_method;
    if (reference_number !== undefined) updateData.reference_number = reference_number;
    if (description !== undefined) updateData.description = description;
    if (receipt_number !== undefined) updateData.receipt_number = receipt_number;
    if (notes !== undefined) updateData.notes = notes;

    const { data, error } = await supabase
      .from('church_contributions')
      .update(updateData)
      .eq('id', req.params.id)
      .select();

    if (error) return handleError(res, error, 'Error updating contribution');
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Contribution not found' });
    }
    res.json({ success: true, message: 'Contribution updated successfully', data: data[0] });
  } catch (err) {
    return handleError(res, err, 'Error updating contribution');
  }
};

// Delete contribution
exports.deleteContribution = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('church_contributions')
      .delete()
      .eq('id', req.params.id)
      .select();

    if (error) return handleError(res, error, 'Error deleting contribution');
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Contribution not found' });
    }
    res.json({ success: true, message: 'Contribution deleted successfully' });
  } catch (err) {
    return handleError(res, err, 'Error deleting contribution');
  }
};

// ============================================
// PROGRESS & REPORTING
// ============================================

// Get contribution progress for all churches for a year
exports.getContributionProgress = async (req, res) => {
  const { year } = req.params;

  try {
    // Get all churches with their targets
    const { data: churches, error: churchError } = await supabase
      .from('churches')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (churchError) return handleError(res, churchError, 'Error fetching churches');

    // Get targets for the year
    const { data: targets, error: targetError } = await supabase
      .from('church_contribution_targets')
      .select('*')
      .eq('year', year);

    if (targetError) return handleError(res, targetError, 'Error fetching targets');

    // Get contributions for the year
    const { data: contributions, error: contribError } = await supabase
      .from('church_contributions')
      .select('church_id, amount')
      .gte('contribution_date', `${year}-01-01`)
      .lte('contribution_date', `${year}-12-31`);

    if (contribError) return handleError(res, contribError, 'Error fetching contributions');

    // Calculate progress for each church
    const progressData = churches.map(church => {
      const target = targets.find(t => t.church_id === church.id);
      const churchContributions = contributions.filter(c => c.church_id === church.id);
      const totalContributed = churchContributions.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
      const targetAmount = target ? parseFloat(target.target_amount) : 0;
      const progressPercentage = targetAmount > 0 ? Math.round((totalContributed / targetAmount) * 100 * 100) / 100 : 0;

      return {
        church_id: church.id,
        church_name: church.name,
        church_code: church.code,
        city: church.city,
        region: church.region,
        pastor_name: church.pastor_name,
        year: parseInt(year),
        target_amount: targetAmount,
        total_contributed: totalContributed,
        remaining_amount: Math.max(0, targetAmount - totalContributed),
        progress_percentage: progressPercentage,
        is_target_set: !!target,
        contribution_count: churchContributions.length
      };
    });

    // Calculate totals
    const totals = {
      total_target: progressData.reduce((sum, p) => sum + p.target_amount, 0),
      total_contributed: progressData.reduce((sum, p) => sum + p.total_contributed, 0),
      total_remaining: progressData.reduce((sum, p) => sum + p.remaining_amount, 0),
      overall_progress: 0,
      churches_on_track: progressData.filter(p => p.progress_percentage >= (new Date().getMonth() + 1) / 12 * 100).length,
      churches_behind: progressData.filter(p => p.progress_percentage < (new Date().getMonth() + 1) / 12 * 100 && p.is_target_set).length
    };
    
    if (totals.total_target > 0) {
      totals.overall_progress = Math.round((totals.total_contributed / totals.total_target) * 100 * 100) / 100;
    }

    res.json({ 
      success: true, 
      data: progressData,
      totals,
      year: parseInt(year)
    });
  } catch (err) {
    return handleError(res, err, 'Error calculating progress');
  }
};

// Get progress for a single church
exports.getChurchProgress = async (req, res) => {
  const { churchId, year } = req.params;

  try {
    // Get church details
    const { data: church, error: churchError } = await supabase
      .from('churches')
      .select('*')
      .eq('id', churchId)
      .single();

    if (churchError) {
      if (churchError.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Church not found' });
      }
      return handleError(res, churchError, 'Error fetching church');
    }

    // Get target for the year
    const { data: target } = await supabase
      .from('church_contribution_targets')
      .select('*')
      .eq('church_id', churchId)
      .eq('year', year)
      .single();

    // Get all contributions for the year
    const { data: contributions, error: contribError } = await supabase
      .from('church_contributions')
      .select('*')
      .eq('church_id', churchId)
      .gte('contribution_date', `${year}-01-01`)
      .lte('contribution_date', `${year}-12-31`)
      .order('contribution_date', { ascending: false });

    if (contribError) return handleError(res, contribError, 'Error fetching contributions');

    const totalContributed = contributions.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
    const targetAmount = target ? parseFloat(target.target_amount) : 0;
    const progressPercentage = targetAmount > 0 ? Math.round((totalContributed / targetAmount) * 100 * 100) / 100 : 0;

    // Calculate monthly breakdown
    const monthlyBreakdown = {};
    for (let i = 1; i <= 12; i++) {
      monthlyBreakdown[i] = 0;
    }
    contributions.forEach(c => {
      const month = new Date(c.contribution_date).getMonth() + 1;
      monthlyBreakdown[month] += parseFloat(c.amount || 0);
    });

    res.json({
      success: true,
      data: {
        church,
        target: target || null,
        year: parseInt(year),
        target_amount: targetAmount,
        total_contributed: totalContributed,
        remaining_amount: Math.max(0, targetAmount - totalContributed),
        progress_percentage: progressPercentage,
        contributions,
        monthly_breakdown: Object.entries(monthlyBreakdown).map(([month, amount]) => ({
          month: parseInt(month),
          amount
        }))
      }
    });
  } catch (err) {
    return handleError(res, err, 'Error fetching church progress');
  }
};

// Get super admin dashboard stats
exports.getSuperAdminStats = async (req, res) => {
  const currentYear = new Date().getFullYear();

  try {
    // Count churches
    const { count: churchCount } = await supabase
      .from('churches')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Count total contributions this year
    const { data: yearContributions } = await supabase
      .from('church_contributions')
      .select('amount')
      .gte('contribution_date', `${currentYear}-01-01`)
      .lte('contribution_date', `${currentYear}-12-31`);

    const totalContributedThisYear = yearContributions?.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0) || 0;

    // Count contributions this month
    const firstDayOfMonth = new Date(currentYear, new Date().getMonth(), 1).toISOString().split('T')[0];
    const lastDayOfMonth = new Date(currentYear, new Date().getMonth() + 1, 0).toISOString().split('T')[0];
    
    const { data: monthContributions } = await supabase
      .from('church_contributions')
      .select('amount')
      .gte('contribution_date', firstDayOfMonth)
      .lte('contribution_date', lastDayOfMonth);

    const totalContributedThisMonth = monthContributions?.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0) || 0;

    // Get total targets for this year
    const { data: yearTargets } = await supabase
      .from('church_contribution_targets')
      .select('target_amount')
      .eq('year', currentYear);

    const totalTargetThisYear = yearTargets?.reduce((sum, t) => sum + parseFloat(t.target_amount || 0), 0) || 0;

    // Count admins
    const { count: adminCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .in('role', ['admin', 'super_admin']);

    res.json({
      success: true,
      stats: {
        totalChurches: churchCount || 0,
        totalContributedThisYear,
        totalContributedThisMonth,
        totalTargetThisYear,
        overallProgress: totalTargetThisYear > 0 
          ? Math.round((totalContributedThisYear / totalTargetThisYear) * 100 * 100) / 100 
          : 0,
        totalAdmins: adminCount || 0,
        currentYear
      }
    });
  } catch (err) {
    return handleError(res, err, 'Error fetching super admin stats');
  }
};
