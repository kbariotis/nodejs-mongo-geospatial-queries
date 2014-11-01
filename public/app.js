/**
 * @fileOverview City Registration app
 */
var Available = function () {
  this.$mapContainer = null;
  this.$searchCityForm = null;
  this.$searchCityInput = null;
  this.$autocompleteObject = null;
  this.$submitBtn = null;

  this.$cityCanonicalNameField = null;
  this.$cityLatField = null;
  this.$cityLngField = null;
};

/**
 * Initialize the Available view.
 */
Available.prototype.init = function () {
  this.$searchCityForm = $('.search-city-form');
  this.$searchCityInput = $('#city');

  this.$cityCanonicalNameField = $('input[name=cityCanonicalName]');
  this.$cityLatField = $('input[name=cityLat]');
  this.$cityLngField = $('input[name=cityLng]');

  this.$submitBtn = $('button[type=submit]');

  this.$searchCityForm.on('keydown', function (event) {
    if (event.keyCode === 13) {
      return false;
    }
  });

  this.$searchCityForm.on('submit', this._submitForm.bind(this));

  this._initAutocomplete();
  this._initMap();
};

/**
 * Initialize Google's Autocomplete library
 *
 * @todo get a list of Country's Geo values to populate the Country's select box
 * like this https://developers.google.com/maps/documentation/javascript/examples/places-autocomplete-hotelsearch
 *
 * @see https://developers.google.com/maps/documentation/javascript/places-autocomplete
 */
Available.prototype._initAutocomplete = function () {

  var options = {
    types: ['(cities)']
  };
  this.$autocompleteObject = new google.maps.places.Autocomplete(this.$searchCityInput[0], options);
  /* Pass native DOM element */

  google.maps.event.addListener(this.$autocompleteObject, 'place_changed', this._changeMapLocation.bind(this));

};

Available.prototype._initMap = function () {
  var mapOptions = {
    center: new google.maps.LatLng(54.8, -4.6),
    zoom: 5,
    mapTypeControl: false,
    panControl: false,
    zoomControl: false,
    streetViewControl: false
  };
  this.$mapContainer = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
};

Available.prototype._changeMapLocation = function () {
  var place = this.$autocompleteObject.getPlace();

  this.$submitBtn.removeClass('btn-success');
  this.$submitBtn.text('Register');

  var that = this;
  $.post('/api/cities/available', {
      lat: place.geometry.location.B,
      lng: place.geometry.location.k
    }
  )
    .done(function (d) {
      if (!$.isEmptyObject(d)) {
        $('.results').text('Found your city : ' + d.name);
        that.$submitBtn.attr('disabled', true);
      } else {
        $('.results').text('You city is available. Register Now!');
        that.$submitBtn.attr('disabled', false);
      }
    })
    .fail(function (d) {});

  if (place.geometry) {
    this.$mapContainer.panTo(place.geometry.location);
    this.$mapContainer.setZoom(15);

    var marker = new google.maps.Marker({
      position: place.geometry.location,
      animation: google.maps.Animation.DROP
    });

    marker.setMap(this.$mapContainer);

    this._populateHiddenForm(place);
  }
};

/**
 * Populate hidden inputs after valid city selection
 * @param place Google PlaceResult https://developers.google.com/maps/documentation/javascript/reference#PlaceResult
 * @private
 */
Available.prototype._populateHiddenForm = function (place) {

  console.log(place);

  if (place.address_components && place.address_components[3] != null) {
    this.$cityCanonicalNameField.val(place.address_components[3].long_name);
  }

  if (place.geometry && place.geometry.location) {
    this.$cityLatField.val(place.geometry.location.B);
    this.$cityLngField.val(place.geometry.location.k);
  }

};

Available.prototype._submitForm = function () {

  /**
   * Validate hidden inputs
   */
  if (
    !this.$cityCanonicalNameField.val() || !this.$cityLatField.val() || !this.$cityLngField.val()
  ) {
    this.$searchCityInput.parent().parent().addClass('has-error');
    return false;
  }

  this.$submitBtn.attr('disabled', true);
  this.$submitBtn.text('Wait...');

  var that = this;
  $.post('/api/cities', {
      name: this.$cityCanonicalNameField.val(),
      lat: this.$cityLatField.val(),
      lng: this.$cityLngField.val()
    }
  )
    .done(function (d) {
      that.$submitBtn.attr('disabled', false);
      that.$submitBtn.text('Done!');
      that.$submitBtn.addClass('btn-success');
    })
    .fail(function (d) {});

  return false;
};

var a = new Available();
a.init();
