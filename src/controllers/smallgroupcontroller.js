const supabase = require("../db")
const jwt = require("jsonwebtoken")

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';

// Helper to extract user_id from memberToken cookie
function getUserIdFromToken(req) {
  try {
    const token = req.cookies?.memberToken;
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.id || null;
  } catch {
    return null;
  }
}

  // creating small group
  exports.createSmallGroup = async (req, res) => {
    const { name, description, leader, meeting_time } = req.body;

    // validation for missing fields
    if (!name || !description || !leader || !meeting_time) {
      return res.status(400).json({
        success: false,
        message: "Please provide all the required fields",
      });
    }

    try {
      const { data, error } = await supabase.from("small_groups").insert([
        {
          name: name,
          description: description,
          leader: leader,
          meeting_time: meeting_time,
        },
      ]);
      if (error) {
        return res.status(500).json({
          success: false,
          message: "Error creating small group",
          error: error.message,
        });
      }
      return res.status(201).json({
        success: true,
        message: "Small group created successfully",
        // data: data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error creating small group",
        error: error.message,
      });
    }
  };

// joining small group
exports.joinSmallGroup = async (req, res) => {
  const { group_id } = req.body;
  // Get user_id from request body or from JWT token cookie
  const user_id = req.body.user_id || getUserIdFromToken(req);

  // validation of missing fields
  if (!group_id || !user_id) {
    return res.status(400).json({
      success: false,
      message: "Please provide all the required fields: group_id and user_id",
    });
  }

  try {
    // check if the user is already a member of the group
    const { data: existingMembership, error: membershipError } = await supabase
      .from("small_group_members")
      .select("*")
      .eq("group_id", group_id)
      .eq("user_id", user_id)
      .maybeSingle();

    if (membershipError) {
      return res.status(500).json({
        success: false,
        message: "Error checking group membership",
        error: membershipError.message,
      });
    }
    if (existingMembership) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of this group",
      });
    }

    // add user to the group by inserting into the join table
    const { data, error } = await supabase
      .from("small_group_members")
      .insert([{ group_id: group_id, user_id: user_id }])
      .select();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Error joining small group",
        // error: error.message,
      });
    }
    return res.status(200).json({
      success: true,
      message: "User joined small group successfully",
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error joining small group",
      // error: error.message,
    });
  }
};

// leaving small group
exports.leavingSmallGroup = async (req, res) => {
  const { group_id } = req.body;
  // Get user_id from request body or from JWT token cookie
  const user_id = req.body.user_id || getUserIdFromToken(req);

  // validation for the missing fields
  if (!group_id || !user_id) {
    return res.status(400).json({
      success: false,
      message: "Please provide all the required fields: group_id and user_id",
    });
  }

  try {
    const { data, error } = await supabase
      .from("small_group_members")
      .delete()
      .eq("group_id", group_id)
      .eq("user_id", user_id)
      .select();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Error leaving small group",
        error: error.message,
      });
    }
    return res.status(200).json({
      success: true,
      message: "User left small group successfully",
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error leaving small group",
      error: error.message,
    });
  }
};

// get all small groups (with member count)
exports.getAllSmallGroups = async (req, res) => {
  try {
    // Join small_groups with small_group_members and users to get member details
    const { data, error } = await supabase
      .from("small_groups")
      .select(`
        *,
        small_group_members (
          id,
          user_id,
          joined_at,
          users ( id, username, email )
        )
      `);

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Error fetching groups",
        error: error.message,
      });
    }

    // Add a member_count field to each group for convenience
    const groupsWithCount = data.map((group) => ({
      ...group,
      member_count: group.small_group_members ? group.small_group_members.length : 0,
    }));

    return res.status(200).json({
      success: true,
      message: "small groups fetched successfully",
      data: groupsWithCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching groups",
      error: error.message,
    });
  }
};

// getting single small group (with its members)
exports.getSingleSmallGroup = async (req, res) => {
  const { id } = req.params;

  try {
    // Join with small_group_members and users to get full member details
    const { data, error } = await supabase
      .from("small_groups")
      .select(`
        *,
        small_group_members (
          id,
          user_id,
          joined_at,
          users ( id, username, email )
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Error fetching group",
        error: error.message,
      });
    }
    return res.status(200).json({
      success: true,
      message: "small group fetched successfully",
      data: {
        ...data,
        member_count: data.small_group_members ? data.small_group_members.length : 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching group",
      error: error.message,
    });
  }
};

// get members of a specific small group: this is a separate endpoint in case we want to fetch just the members without the group details
exports.getMembersOfSmallGroup = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("small_group_members")
      .select(`
        id,
        joined_at,
        users ( id, username, email )
      `)
      .eq("group_id", id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Error fetching group members",
        error: error.message,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Group members fetched successfully",
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching group members",
      error: error.message,
    });
  }
};

// getting small groups for a specific user
exports.getSmallGroupsForUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const { data, error } = await supabase
      .from("small_group_members")
      .select(`
        *,
        small_groups ( id, name, description, leader, meeting_time )
      `)
      .eq("user_id", userId);

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Error fetching user's groups",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "User's small groups fetched successfully",
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching user's groups",
      error: error.message,
    });
  }
};