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
  password: {
    type: String,
    require: [true, 'password is required'],
    minLength: 8,
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

// Model variable must start with upercase by convention
const UserModel = mongoose.model('Users', userSchema);
module.exports = UserModel;
