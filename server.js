// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express'); 		// call express
var app = express(); 				// define our app using express
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var City = require('./app/models/city');

mongoose.connect('mongodb://localhost:27017/geospatial'); // connect to our database

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
var router = express.Router(); 				// get an instance of the express Router

router.get('/', function (req, res) {
  res.render('index', {title: 'Hey', message: 'Hello there!'});
});

router.route('/api/cities')

  .post(function (req, res) {

    var city = new City(); 		// create a new instance of the Bear model
    city.name = req.body.name;  // set the bears name (comes from the request)
    city.geo = [req.body.lng, req.body.lat];  // set the bears name (comes from the request)

    var distance = 1000 / 6371;
    var query = City.findOne(
      {
        'geo': {
          $near: [city.geo[1], city.geo[0]],
          $maxDistance: distance
        }
      }
    );
    query.exec(function (err, city) {
      if (err) {
        console.log(err);
        throw err;
      }

      if (!city) {
        // save the bear and check for errors
        city.save(function (err) {
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
  var distance = 1000 / 6371;

  var query = City.findOne(
    {
      'geo': {
        $near: [req.body.lat, req.body.lng],
        $maxDistance: distance
      }
    }
  );
  query.exec(function (err, city) {
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

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);