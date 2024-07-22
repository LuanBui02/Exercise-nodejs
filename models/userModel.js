const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, 'Please choose your name'],
    },
    email: {
      type: String,
      require: [true, 'Please enter your email'],
      unique: true,
      lowercase: true,
      validator: [validator.isEmail, 'Please enter valid email'],
    },
    photo: {
      type: String,
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'guide', 'lead-guide', 'admin'],
        message: `Roles just have 'user', 'guide', 'lead-guide', 'admin'`,
      },
      default: 'user',
    },
    password: {
      type: String,
      require: [true, 'Please enter your password'],
      minlength: 8,
    },
    passwordChangeAt: {
      type: Date,
      required: [true, 'test'],
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordConfirm: {
      type: String,
      require: [true, 'Please confirm your password'],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: 'Password is not the same',
      },
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangeAt) {
    const changedTimestamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10,
    );
    console.log(JWTTimestamp, changedTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};
userSchema.methods.createResetPassword = function () {
  const resetToken = crypto.randomBytes(16).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  console.log(resetToken, this.passwordResetToken);
  return resetToken;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
