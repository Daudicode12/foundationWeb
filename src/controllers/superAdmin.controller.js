//importing the necessary modules
const { SuperAdmin } = require('../models/superAdmin.model');
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
        const {data, errpr} = await supabase
        .from('admins')
        .select('*')
        .order('created_at', {ascending: false});

        if(error) return handleError(res, error, "error fetching admins");
        res.json({success: true, data});
    }
}