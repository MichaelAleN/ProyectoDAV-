const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  fullName: String,
  role: { type: String, enum: ['administrator', 'seller'], default: 'seller' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  security: {
    lastLogin: Date,
    loginCount: { type: Number, default: 0 },
    failedAttempts: { type: Number, default: 0 }
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.fullName = `${this.firstName} ${this.lastName}`;
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateToken = function() {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ id: this._id, username: this.username, role: this.role },
    process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

module.exports = mongoose.model('User', userSchema);