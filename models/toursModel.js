const mongoose = require('mongoose');

// create a basic tour schema
// Schema is used to validate data
const tourSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], unique: true },

  description: { type: String, required: [true, 'Description is required'] },
});

// create a basic tour model
// Use capital letter for the first letter to declaring a model variable
const TourModel = mongoose.model('Tour', tourSchema);
module.exports = TourModel;
