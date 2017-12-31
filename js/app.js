// Model
var Notification = {
    message: null
};

var CategoryList = function () {
    var self = this;
    self.categories = ko.observableArray();
    self.findByName = function (name) {
        var categories = self.categories();
        return categories.find(function (category) {
            return category.name() === name;
        });
    };
};

var LocationList = function () {
    this.locations = ko.observableArray();
};

var Category = function (data) {
    this.name = ko.observable(data.name);
    this.iconUrl = ko.observable(data.icon.prefix + '32' + data.icon.suffix);
    this.locations = ko.observableArray();
};

var Location = function (data) {
    var hours = data.hours && data.hours.status;

    this.name = ko.observable(data.name);
    this.hours = ko.observable(hours || 'Open');
    this.position = ko.observable(data.location);
};

var categoryList = new CategoryList();
var locationList = new LocationList();

// Octopus
var Octopus = {
    init: function () {
        Octopus.getLocationRecommendations();

        MapView.init();
        NotificationView.init();

        ko.applyBindings(ViewModel);

        Octopus.notify('Welcome to APP_NAME!');
    },

    getLocationRecommendations: function () {
        var params = {
            client_id: 'FOURSQUARE_CLIENT_ID',
            client_secret: 'FOURSQUARE_CLIENT_SECRET',
            ll: '13.7248936,100.493025',
            radius: 5000,
            section: 'topPicks',
            v: '20171231'
        };

        var request = $.ajax({
            dataType: 'json',
            url: 'https://api.foursquare.com/v2/venues/explore',
            data: params
        });

        request.done(function (data) {
            var items = data.response.groups[0].items;

            items.forEach(function (item) {
                var location = new Location(item.venue);
                locationList.locations.push(location);

                var category = categoryList.findByName(item.venue.categories[0].name);
                if (!category) {
                    category = new Category(item.venue.categories[0]);
                    categoryList.categories.push(category);
                }
                category.locations.push(location);
            });

            MapView.render(locationList.locations);
        });

        request.fail(function (jqXHR, textStatus) {
            Octopus.notify('Failed to get location recommendations: ' + textStatus);
        });
    },

    hasNotificationMessage: function () {
        return Octopus.getNotificationMessage() !== null;
    },

    getNotificationMessage: function () {
        return Notification.message;
    },

    notify: function (message) {
        Notification.message = message;
        NotificationView.render();
        setTimeout(function () {
            Notification.message = null;
            NotificationView.render();
        }, 3000);
    },

    animateLocationMarker: function (location) {
        var marker = MapView.markersTable[location.name()];
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                marker.setAnimation(null);
            }, 1400);
        }
    }
};

// View Model
var CategoryListViewModel = function () {
    this.categories = categoryList.categories;
    this.handleClick = null;
};

var ViewModel = {
    CategoryList: CategoryListViewModel
};

// View
var NotificationView = {
    init: function () {
        NotificationView.element = $('.notification');
        NotificationView.render();
    },

    render: function () {
        if (Octopus.hasNotificationMessage()) {
            NotificationView.element.html(
                '<p>' + Octopus.getNotificationMessage() + '</p>'
            );
            NotificationView.element.show();
        } else {
            NotificationView.element.hide();
        }
    }
};

var MapView = {
    init: function () {
        var bangkok = {
            lat: 13.7455157,
            lng: 100.5346039
        };

        MapView.map = new google.maps.Map(
            $('.map').get(0), {
                center: bangkok,
                zoom: 13
            }
        );

        MapView.markers = [];
    },

    render: function (locations) {
        MapView.markers.forEach(function (marker) {
            marker.setMap(null);
        });
        MapView.markers = [];

        locations().forEach(function (location) {
            var marker = new google.maps.Marker({
                position: location.position(),
                animation: google.maps.Animation.DROP,
                map: MapView.map
            });

            MapView.markers.push(marker);
        });
    }
};

// Initialize
Octopus.init();
