const mongoose = require('mongoose');

// create a basic tour schema
// Schema is used to validate data
const tourSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], unique: true },
  duration: { type: Number, required: [true, 'Duration is required'] },
  description: { type: String, required: [true, 'Description is required'] },
  imageCover: { type: String, required: [true, 'Image cover is required'] },
  images: [String],
  // Setting select propretie to createAt to false to not send it in
  // the response
  createAt: { type: Date, default: Date.now(), select: false },
  price: { type: Number },
  ratingAverage: { type: Number, default: 0 },
});

// create a basic tour model
// Use capital letter for the first letter to declaring a model variable
const TourModel = mongoose.model('Tour', tourSchema);
module.exports = TourModel;
