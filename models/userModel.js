const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, require: [true, 'Name is required'] },
  email: {
    type: String,
    require: [true, 'email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  passwordChangeAt: { type: Date },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    require: [true, 'password is required'],
    minLength: 8,
    // use select : false to hide the field in every request
    select: false,
  },
  passwordConfirm: {
    type: String,
    require: [true, 'Plese confirm your password'],
    validate: {
      // must use regular function declaration not arrow function
      // to be able to use the this keyword
      // it's only work for SAVE and SAVE !!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password are not matches',
    },
  },
  photo: { type: String },
  passwordResetToken: String,
  passwordResetExpires: Date,
});

/* 
  Encripting the password before save
  Only run this function if password was actually modified

*/
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // Delete passwordConfirm fields
  this.passwordConfirm = undefined;
  next();
});

/* 
  Create an instance statics methode which will be available in all
  all the document on the certain collection.
  Because of password select is set to fals, so the this.password
  will not be availabel. For that we pass the userPassword as parameter of this function
  wich will be used on authController to check if the incomming password is the same as
  the user encrypted password.

  the system is tha we encrypted the incomming password and compare it to the 
  user password frome data base wich is encrypted on it's creation.
  If thei are the same, so the function will return true.
*/
userSchema.statics.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// test if user has changed his password
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangeAt) {
    const changedTimestamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  // false mean that password is NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10min
  console.log({ resetToken }, this.passwordResetToken);
  return resetToken;
};

// Model variable must start with upercase by convention
const UserModel = mongoose.model('Users', userSchema);
module.exports = UserModel;
