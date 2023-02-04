const mongoose = require('mongoose');
const slugify = require('slugify');
// create a basic tour schema
// Schema is used to validate data
const tourSchema = new mongoose.Schema(
  {
    // _id: { type: String },
    slug: { type: String },
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
    sectretTour: { type: Boolean, default: false },
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
  7/ Virtual propreties are defined on the schema
 */
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

/* 
  1/ pre() midleware is runing before an actual event
  2/ the event in this case is the save() event and .create() commande
  3/ the callback function is callde before teh document is saved to the db
  4/ the pre() will not run on .insertMany() or findbyIdAndUpdate
  it will only run on save
*/

// DOCUMENT MIDDLEWARE
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

/* 
 1/ post() middleware is runing after the save event is trigged
*/
tourSchema.post('save', (doc, next) => {
  console.log(`Will save document : ${doc}`);
  next();
});

// QUERY MIDDLEWARE
/* 
  1/ Query middleware allow us to run function before or after a query is executed
  2/ The this is pointing to the query
  3/ the middleware bellow is used to show tours thas secretTour is Not Equal to true
  3/ It'is not best practice to make a copy paste from the find
  to create the findOne query. Insted we should use
  regular expression. So we comment the findOne but not
  remove it to set it as reference.
  4/ The regular expresion below is use to make run the
  query middleware in every request that start with find : 
  find or findOne
  */
tourSchema.pre(/^find/, function (next) {
  this.find({ sectretTour: { $ne: true } });
  next();
});

// tourSchema.pre('findOne', function (next) {
//   this.find({ sectretTour: { $ne: true } });
//   next();
// });

// AGREGATION MIDDLEWARE
/*
  This middleware is runing before the aggreation is called
  This is use to remove the secretTour before runing the aggregation
*/
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { sectretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

// create a basic tour model
// Use capital letter for the first letter to declaring a model variable
const TourModel = mongoose.model('Tour', tourSchema);
module.exports = TourModel;
