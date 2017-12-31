// Model
var Location = function (data) {
    var self = this;

    self.category = data.venue.categories[0].name;
    self.marker = null;
    self.name = data.venue.name;
    self.position = data.venue.location;
    self.hours = data.venue.hours && data.venue.hours.status;
    self.tips = [];

    data.tips.forEach(function (tip) {
        self.tips.push({
            content: tip.text,
            author: [tip.user.firstName, tip.user.lastName].join(' ')
        });
    });
};


// View Model
var ViewModel = function (map) {
    var self = this;

    self.allLocations = ko.observableArray();
    self.selectedLocation = ko.observable();
    self.selectedCategory = ko.observable();

    self.allCategories = ko.pureComputed(function () {
        return self.allLocations().map(function (location) {
            return location.category;
        });
    });

    self.isInSelectedCategory = function (location) {
        if (!self.selectedCategory()) {
            return true;
        } else {
            return location.category == self.selectedCategory();
        }
    };

    self.filteredLocations = ko.pureComputed(function () {
        return self.allLocations().filter(self.isInSelectedCategory);
    });

    ko.computed(function () {
        self.allLocations().forEach(function (location) {
            var marker = location.marker;

            if (marker) {
                if (self.isInSelectedCategory(location)) {
                    marker.setMap(map);
                    marker.setAnimation(google.maps.Animation.DROP);
                } else {
                    marker.setMap(null);
                }
            } else {
                marker = new google.maps.Marker({
                    animation: google.maps.Animation.DROP,
                    map: map,
                    position: location.position
                });

                marker.addListener('click', function () {
                    self.selectedLocation(location);
                });

                location.marker = marker;
            }
        });
    });

    // Get recommended locations from Foursquare
    $.ajax({
            dataType: 'json',
            url: 'https://api.foursquare.com/v2/venues/explore',
            data: {
                client_id: 'FOURSQUARE_CLIENT_ID',
                client_secret: 'FOURSQUARE_CLIENT_SECRET',
                near: 'Bangkok, Thailand',
                v: '20180101'
            }
        })
        .done(function (data) {
            data.response.groups[0].items.forEach(function (item) {
                self.allLocations.push(new Location(item))
            });
        })
        .fail(function (xhr, status) {
            console.log('Failed to load locations: ' + status);
        });
};


// Initialize
var map = new google.maps.Map(
    $('.map').get(0), {
        center: {
            lat: 13.7455157,
            lng: 100.5346039
        },
        zoom: 13
    }
);
var viewModel = new ViewModel(map);
ko.applyBindings(viewModel);
