// Purpose: User Mongoose model — passwordHash field only, never plain password
'use strict';

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,
      maxlength: [100, 'Name too long'],
    },
    phone: {
      type:     String,
      required: [true, 'Phone is required'],
      unique:   true,
      trim:     true,
      match:    [/^\d{10}$/, 'Phone must be exactly 10 digits'],
    },
    passwordHash: {
      type:     String,
      required: [true, 'Password hash is required'],
      select:   false, // never returned in queries unless explicitly selected
    },
    role: {
      type:    String,
      enum:    ['user', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

// Guard: block direct assignment of 'password' field
userSchema.pre('save', function (next) {
  if (this.password !== undefined) {
    return next(new Error('Do not set .password directly — use .passwordHash with argon2id'));
  }
  next();
});

// Never include passwordHash in JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
