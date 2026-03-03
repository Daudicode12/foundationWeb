//importing the necessary modules
const supabase = require('../db');

// helper funcction to handle error

function handleError (res, error, message = "server error"){
    return res.status(500).json({
        success: false,
        message: message,
        error: error.message || error
    })
}

// list all admins
exports.listAdmins = async (req, res) => {
    try {
        const {data, error} = await supabase
        .from('users')
        .select('id, username, email, phone, role, is_approved, created_at')
        .in('role', ['admin'])
        .order('created_at', {ascending: false});

        if(error) return handleError(res, error, "error fetching admins");

        return res.status(200).json({success: true, data});
    }catch (error) {
        return handleError(res, error);
    }
}

// list pending (unapproved) admins
exports.listPendingAdmins = async (req, res) => {
    try {
        const {data, error} = await supabase
        .from('users')
        .select('id, username, email, phone, role, is_approved, created_at')
        .eq('role', 'admin')
        .eq('is_approved', false)
        .order('created_at', {ascending: false});

        if(error) return handleError(res, error, "error fetching pending admins");

        return res.status(200).json({success: true, data});
    }catch (error) {
        return handleError(res, error);
    }
}

// count pending admins
exports.countPendingAdmins = async (req, res) => {
    try {
        const {count, error} = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin')
        .eq('is_approved', false);

        if(error) return handleError(res, error, "error counting pending admins");

        return res.status(200).json({success: true, count: count || 0});
    }catch (error) {
        return handleError(res, error);
    }
}

// approve an admin
exports.approveAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        // Verify the user exists and is an admin
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('id, username, email, role, is_approved')
            .eq('id', id)
            .single();

        if (fetchError || !user) {
            return res.status(404).json({ success: false, message: "Admin user not found" });
        }

        if (user.role !== 'admin') {
            return res.status(400).json({ success: false, message: "User is not an admin" });
        }

        if (user.is_approved) {
            return res.status(400).json({ success: false, message: "Admin is already approved" });
        }

        const { data, error } = await supabase
            .from('users')
            .update({ is_approved: true, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select('id, username, email, role, is_approved');

        if (error) return handleError(res, error, "error approving admin");

        return res.status(200).json({ 
            success: true, 
            message: `Admin "${user.username}" has been approved successfully`,
            data: data[0]
        });
    } catch (error) {
        return handleError(res, error);
    }
}

// reject (remove) an admin - sets role back to member
exports.rejectAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        // Verify the user exists and is an admin
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('id, username, email, role, is_approved')
            .eq('id', id)
            .single();

        if (fetchError || !user) {
            return res.status(404).json({ success: false, message: "Admin user not found" });
        }

        if (user.role !== 'admin') {
            return res.status(400).json({ success: false, message: "User is not an admin" });
        }

        // Demote back to member and remove approval
        const { data, error } = await supabase
            .from('users')
            .update({ role: 'member', is_approved: true, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select('id, username, email, role, is_approved');

        if (error) return handleError(res, error, "error rejecting admin");

        return res.status(200).json({ 
            success: true, 
            message: `Admin "${user.username}" has been rejected and demoted to member`,
            data: data[0]
        });
    } catch (error) {
        return handleError(res, error);
    }
}

// revoke admin approval (set is_approved back to false)
exports.revokeAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('id, username, email, role, is_approved')
            .eq('id', id)
            .single();

        if (fetchError || !user) {
            return res.status(404).json({ success: false, message: "Admin user not found" });
        }

        if (user.role !== 'admin') {
            return res.status(400).json({ success: false, message: "User is not an admin" });
        }

        const { data, error } = await supabase
            .from('users')
            .update({ is_approved: false, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select('id, username, email, role, is_approved');

        if (error) return handleError(res, error, "error revoking admin");

        return res.status(200).json({ 
            success: true, 
            message: `Admin access for "${user.username}" has been revoked`,
            data: data[0]
        });
    } catch (error) {
        return handleError(res, error);
    }
}