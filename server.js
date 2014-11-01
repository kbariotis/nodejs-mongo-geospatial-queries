var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var City = require('./app/models/city');

var mongoUri = process.env.MONGOLAB_URI ||
               process.env.MONGOHQ_URL ||
               'mongodb://localhost:27017/geospatial';
mongoose.connect(mongoUri);

app.set('views', './public');
app.set('view engine', 'jade');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

var port = process.env.PORT || 8080; 		// set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();

router.get('/', function (req, res) {
  res.render('index', {title: 'Hey', message: 'Hello there!'});
});

router.route('/api/cities')

  .post(function (req, res) {

    City.checkIfCityExists(req.body.lat, req.body.lng, function (err, city) {
      if (err) {
        console.log(err);
        throw err;
      }

      if (!city) {
        var cityModel = new City();
        cityModel.name = req.body.name;
        cityModel.geo = [req.body.lat, req.body.lng];

        cityModel.save(function (err) {
          if (err)
            res.send(err);

          res.json({});
        });
      } else {
        console.log('Cant save: Found city:' + city);
        res.json(city);
      }
    });

  });

router.post('/api/cities/available', function (req, res) {
  City.checkIfCityExists(req.body.lat, req.body.lng, function (err, city) {
    if (err) {
      console.log(err);
      throw err;
    }

    if (!city) {
      console.log('Found nothing');
      res.json({});
    } else {
      console.log('Found city:' + city);
      res.json(city);
    }
  });
});

app.use('/', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
