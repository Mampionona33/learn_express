const mongoose = require('mongoose');
const validator = require('validator');

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
  },
  photo: { type: String },
});

// Model variable must start with upercase by convention
const UserModel = mongoose.model('Users', userSchema);
module.exports = UserModel;
