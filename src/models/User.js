const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    required: true,
    trim: true,
    type: String
  },
  age: {
    type: Number,
    default: 0,
    validate(age) {
      if (age < 0) {
        throw new Error(`Age must be a positive number`);
      }
    }
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate(email) {
      if (!validator.isEmail(email)) {
        throw new Error('Email is invalid');
      }
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate(password) {
      if (password.length < 7) {
        throw new Error('Password must be at least 7 characters');
      }
    }
  }
});

UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();
  }
});

UserSchema.checkPassword = async (password, hash) => {
  const isCorrect = await bcrypt.compare(password, hash);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
