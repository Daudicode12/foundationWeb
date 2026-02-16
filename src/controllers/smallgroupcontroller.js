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