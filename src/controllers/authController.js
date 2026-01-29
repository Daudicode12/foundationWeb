const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';
const JWT_EXPIRES_IN = '24h';

// Signup
const signup = async (req, res) => {
  const { userName, email, phone, password } = req.body;

  if (!userName || !email || !phone || !password) {
    return res.status(400).send("All fields are required");
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert([{ username: userName, email, phone, password: hash }])
      .select();

    if (error) {
      console.error("Error inserting user:", error);
      return res.status(500).json({ success: false, message: "Database error: " + error.message });
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      redirect: "/logins/login.html"
    });
  } catch (err) {
    console.error("Error hashing password:", err);
    return res.status(500).send("Server error");
  }
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (error) {
      console.error("Error fetching user:", error);
      return res.status(500).send("Server error");
    }

    if (!users || users.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        userName: user.username,
        role: user.role || 'member'
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      redirect: "/dashboard/dashboard.html",
      token: token,
      userName: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role || 'member',
      expiresIn: JWT_EXPIRES_IN
    });
  } catch (err) {
    console.error("Error during login:", err);
    return res.status(500).send("Server error");
  }
};

// Admin Login
const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  try {
    const { data: admins, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('role', 'admin');

    if (error) {
      console.error("Error fetching admin:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }

    if (!admins || admins.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid admin credentials" });
    }

    const admin = admins[0];
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid admin credentials" });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        userName: admin.username,
        role: 'admin'
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: "Admin login successful",
      token: token,
      email: admin.email,
      userName: admin.username,
      role: admin.role,
      expiresIn: JWT_EXPIRES_IN
    });
  } catch (err) {
    console.error("Error during admin login:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Verify Token
const verifyToken = (req, res) => {
  let token = req.body.token;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ valid: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({
      valid: true,
      success: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        userName: decoded.userName,
        role: decoded.role
      }
    });
  } catch (err) {
    res.status(401).json({ valid: false, message: "Invalid or expired token" });
  }
};

// Refresh Token
const refreshToken = (req, res) => {
  let token = req.body.token;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });

    const tokenAge = Date.now() / 1000 - decoded.iat;
    if (tokenAge > 7 * 24 * 60 * 60) {
      return res.status(401).json({ success: false, message: "Token too old, please login again" });
    }

    const newToken = jwt.sign(
      {
        id: decoded.id,
        email: decoded.email,
        userName: decoded.userName,
        role: decoded.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      token: newToken,
      expiresIn: JWT_EXPIRES_IN
    });
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

module.exports = {
  signup,
  login,
  adminLogin,
  verifyToken,
  refreshToken
};
