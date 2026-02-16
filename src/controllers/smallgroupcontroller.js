const supabase = require('../db')
(
// creating small group
exports.createSmallGroup = async(req, res)=> {
    const { name, description, leader, meeting_time } = req.body;

    // validation for missing fields
    if (!name || !description || !leader || !meeting_time){
        return res.status(400).json({
            success: false,
            message: 'Please provide all the required fields'
        });
    }

    try {
        const {data, error} = await supabase
        .from('small_groups')
        .insert([
            {
                name: name,
                description: description,
                leader: leader,
                meeting_time: meeting_time
            }
        ]);
        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Error creating small group',
                error: error.message
            });
        }
        return res.status(201).json({
            success: true,
            message: 'Small group created successfully',
            data: data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error creating small group',
            error: error.message
        });
    }
})

// joining small group
exports.joinSmallGroup = async(req, res) => {
    const { group_id, user_id } = req.body;

    // validation of missing fields
    if(!group_id || !user_id){
        return res.status(400).json({
            success: false,
            message: "Please provide all the required fields: group_id and user_id"
        })
    }

    // check if the user is already a member of the group
    try {
        const {data: existingMembership, error: membershipError} = await supabase
        .from('small_groups')
        .select('*')
        .eq('id', group_id)
        .contains('members', [user_id])
        .single();

        // if there's an error other than no rows found, return it
        if(membershipError && membershipError.code !== 'PGRST116'){
            return res.status(500).json({
                success: false,
                message: 'Error checking group membership',
                error: membershipError.message
            });
        }
        if(existingMembership){
            return res.status(400).json({
                success: false,
                message: 'User is already a member of this group'
            });
        }

        // add user to the group
        const {data, error} = await supabase
        .from('small_groups')
        .update({
            members: supabase.raw('array_append(members, ?)', [user_id])
        })
        .eq('id', group_id)
        .select();

        if(error){
            return res.status(500).json({
                success: false,
                message: 'Error joining small group',
                error : error.message
            });
        }
        return res.status(200).json({
            success: true,
            message: 'User joined small group successfully',
            data: data
        });
    } catch (error){
        return res.status(500).json({
            success: false,
            message: 'Error joining small group',
            error: error.message
        });
    }
}

// leaving small group
exports.leavingSmallGroup = async(req, res) => {
    const {group_id, user_id } = req.body;

    // validation for the missing fields
    if(!group_id || !user_id){
        return res.status(400).json({
            success: false,
            message: "Please provide all the required fields: group_id and user_id"
        })
    }

    try {
        const{data, error } = await supabase
        .from('small_groups')
        .update({
            members: supabase.raw('array_remove(members, ?)', [user_id] )
        })
        .eq('id', group_id)
        .select();

        if(error){
            return res.status(500).json({
                success: false,
                message: 'Error leaving small group',
                error : error.message
            });
        }
        return res.status(200).json({
            success: true,
            message: 'User left small group successfully',
            data: data
        });
    } catch (error){
        return res.status(500).json({
            success: false,
            message: 'Error leaving small group',
            error: error.message
        });
    }
}