const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./Task');

const UserSchema = new mongoose.Schema(
  {
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
      unique: true,
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
    },
    tokens: [
      {
        token: {
          type: String,
          required: true
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

UserSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'user'
});

// UserSchema.set('toObject', { virtual: true });
// UserSchema.set('toJSON', { virtual: true });

UserSchema.methods.generateAuthToken = async function () {
  const token = jwt.sign({ _id: this._id.toString() }, 'thisissupersecretkey', { expiresIn: '7 days' });
  this.tokens = this.tokens.concat({ token });
  await this.save();
  return token;
};

UserSchema.methods.toJSON = function () {
  const userObject = this.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

UserSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Unable to login');
  }

  const isCorrect = await bcrypt.compare(password, user.password);

  if (!isCorrect) {
    throw new Error('Unable to login');
  }

  return user;
};

// Middleware

// Hash password before saved
UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();
  }
});

// Delete tasks when user deleted
UserSchema.pre('remove', async function (next) {
  await Task.deleteMany({ user: this._id });
  next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
