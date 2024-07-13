const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
  userid: { type: Schema.Types.ObjectId, auto: true, index: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, default: null },
  isLogout: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false }
});

userSchema.pre('save', async function(next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    
    const passwordHash = await bcrypt.hash(this.password, salt);
    
    this.password = passwordHash;
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('User', userSchema);
