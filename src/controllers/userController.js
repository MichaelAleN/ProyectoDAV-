const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    const token = user.generateToken();
    res.status(201).json({ success: true, data: { user, token } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }
    if (user.status !== 'active') {
      return res.status(401).json({ success: false, message: 'Usuario inactivo' });
    }
    user.security.lastLogin = new Date();
    user.security.loginCount += 1;
    await user.save();
    const token = user.generateToken();
    res.status(200).json({ 
      success: true, 
      data: { 
        user: { id: user._id, username: user.username, fullName: user.fullName, role: user.role }, 
        token 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    res.status(200).json({ success: true, data: req.user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
