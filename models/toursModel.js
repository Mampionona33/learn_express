const mongoose = require('mongoose');

// create a basic tour schema
// Schema is used to validate data
const tourSchema = new mongoose.Schema(
  {
    // _id: { type: String },
    name: { type: String, required: [true, 'Name is required'], unique: true },
    duration: { type: Number, required: [true, 'Duration is required'] },
    description: { type: String, required: [true, 'Description is required'] },
    imageCover: { type: String, required: [true, 'Image cover is required'] },
    images: [String],
    // Setting select propretie to createAt to false to not send it in the response
    createAt: { type: Date, default: Date.now(), select: false },
    price: { type: Number },
    ratingAverage: { type: Number, default: 0 },
    startDate: { type: [Date] },
  },
  {
    // each time that data is outputed as json or/and as an object
    // we want virtual to be part of respons
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/*
  1/ use the get methode to execute the virtual propreties
  when get query is executed. the this propretie is pointing
  to the current document.
  2/ Use a regular fonction insted of arrow funtion to be abble to use
  the this propretie.
  3/ If tours has 7 days, that gone be 1 week
  4/ the durationWeeks is not available in the database but it
  is call as soon as we get the data
  5/ adding the virtual propreties to the schema options
  to show then in the query respons
  6/ the virtual proprety can'not be used in a query proprety
  because they are not part of database. So we can'not say 
  for example tourModel.find($eq:{durationWeeks : 7})
 */
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// create a basic tour model
// Use capital letter for the first letter to declaring a model variable
const TourModel = mongoose.model('Tour', tourSchema);
module.exports = TourModel;
