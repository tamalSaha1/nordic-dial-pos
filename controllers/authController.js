const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @route  POST /api/auth/login
// @desc   Single login endpoint for both Manager and Staff - role comes from the DB record,
//         not from what the user selects, so no one can fake being a manager on the client.
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'This account has been deactivated. Contact your manager.' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
};

// @route  GET /api/auth/me
// @desc   Return the currently logged-in user (used by the frontend to restore session)
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { login, getMe };
