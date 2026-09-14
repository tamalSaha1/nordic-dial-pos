const User = require('../models/User');

// @route  GET /api/users        (manager only)
const getUsers = async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users);
};

// @route  POST /api/users       (manager only) - create a new staff or manager account
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role === 'manager' ? 'manager' : 'staff',
    });

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error creating user', error: err.message });
  }
};

// @route  PUT /api/users/:id    (manager only) - update role/status, or reset password
const updateUser = async (req, res) => {
  try {
    const { name, role, status, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (role) user.role = role;
    if (status) user.status = status;
    if (password) user.password = password; // pre-save hook will hash it

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error updating user', error: err.message });
  }
};

// @route  DELETE /api/users/:id (manager only)
const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (String(user._id) === String(req.user._id)) {
    return res.status(400).json({ message: "You can't delete your own account while logged in" });
  }

  await user.deleteOne();
  res.json({ message: 'User removed' });
};

module.exports = { getUsers, createUser, updateUser, deleteUser };
