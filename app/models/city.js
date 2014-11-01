var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var CitySchema   = new Schema({
  name: String,
  geo: {
    type: [Number],
    index: '2d'
  }
});

var CityModel = module.exports = mongoose.model('City', CitySchema);

CityModel.checkIfCityExists = function(lat, lng, cb) {
  var distance = 1000 / 6371;
  var query = this.findOne(
    {
      'geo': {
        $near: [lat, lng],
        $maxDistance: distance
      }
    }
  );
  query.exec(cb);
};
