class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);
    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    // replace gte|gt|lte|lt by mongodb operators $gte|$gt|$lte|$lt
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query.find(JSON.parse(queryStr));

    // return this allow to chain the methodes
    return this;
  }

  sort() {
    // 2) Sorting
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split('.').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // default sorting if user does not give sorting
      // the minus signe "-" is use to invert order of sorting
      this.query = this.query.sort('-createAt');
    }
    return this;
  }

  limitFields() {
    // 3) Field limiting
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split('.').join(' ');
      this.query = this.query.select(fields);
    } else {
      // This is use to remove the __v variable in the fields
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    // 4) Pagination
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    // page=10&limit=10 <=> query.skip(10).limit(10) <=> 1-10 page1 ; 11-20 page 2; ...
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
