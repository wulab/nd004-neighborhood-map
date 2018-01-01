// Model
var Location = function (data) {
    var self = this;
    var category = data.venue.categories[0];

    self.category = category.name;
    self.hours = data.venue.hours && data.venue.hours.status;
    self.marker = null;
    self.name = data.venue.name;
    self.number = data.index + 1;
    self.position = data.venue.location;
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
    var listener;

    self.allLocations = ko.observableArray();
    self.selectedLocation = ko.observable();
    self.selectedCategory = ko.observable('All Categories');

    self.allCategories = ko.pureComputed(function () {
        var categories = ['All Categories'];
        var locations = self.allLocations();

        locations.forEach(function (location) {
            if (categories.indexOf(location.category) === -1) {
                categories.push(location.category)
            }
        });

        return categories.sort();
    });

    self.isInSelectedCategory = function (location) {
        if (self.selectedCategory() == 'All Categories') {
            return true;
        } else {
            return location.category == self.selectedCategory();
        }
    };

    self.filteredLocations = ko.pureComputed(function () {
        return self.allLocations().filter(self.isInSelectedCategory);
    });

    self.handleLocationClick = function (location) {
        self.selectedLocation(location);
        map.panTo(location.position);
        map.setZoom(15);

        if (location.marker) {
            location.marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                location.marker.setAnimation(null);
            }, 1400);
        }
    };

    // Create or update map markers when selected category changes
    ko.computed(function () {
        var latLngBounds = new google.maps.LatLngBounds();

        self.allLocations().forEach(function (location) {
            var marker = location.marker;

            if (marker) {
                if (self.isInSelectedCategory(location)) {
                    marker.setMap(map);
                    marker.setAnimation(google.maps.Animation.DROP);
                    latLngBounds.extend(marker.getPosition());
                } else {
                    marker.setMap(null);
                }
            } else {
                marker = new google.maps.Marker({
                    animation: google.maps.Animation.DROP,
                    label: String(location.number),
                    map: map,
                    position: location.position
                });

                marker.addListener('click', function () {
                    self.handleLocationClick(location);
                });

                location.marker = marker;
                latLngBounds.extend(marker.getPosition());
            }
        });

        google.maps.event.removeListener(listener);
        listener = google.maps.event.addDomListener(window, 'resize', fitBounds);
        fitBounds();

        function fitBounds() {
            map.fitBounds(latLngBounds);
        }
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
            var items = data.response.groups[0].items;
            items.forEach(function (item, index) {
                item.index = index;
                self.allLocations.push(new Location(item))
            });
        })
        .fail(function (xhr, status) {
            alert('Failed to load data from Foursquare');
        });
};


// Called when Google Maps script finish executing
function initMap() {
    // Render map to div#map element
    var map = new google.maps.Map(
        document.getElementById('map'), {
            center: {
                lat: 13.7455157,
                lng: 100.5346039
            },
            maxZoom: 17,
            zoom: 13
        }
    );


    // Initialize KnockoutJS
    var viewModel = new ViewModel(map);
    ko.applyBindings(viewModel);
}


// Notify user when Google Maps script fails to load
function handleMapError() {
    alert('Failed to load Google Maps');
}
