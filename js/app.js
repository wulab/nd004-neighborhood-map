// Model
var Notification = {
    message: null
};

var Location = function (data) {
    var hours = data.hours && data.hours.status;
    // var icon = data.categories && data.categories[0].icon;

    this.name = ko.observable(data.name);
    this.hours = ko.observable(hours || 'Open');
    this.position = ko.observable(data.location);
    // this.iconUrl = ko.observable(icon.prefix + 'bg_32' + icon.suffix);
};

// Octopus
var Octopus = {
    init: function () {
        Octopus.getLocationRecommendations();

        MapView.init();
        NotificationView.init();

        ko.applyBindings(ViewModel);

        Octopus.notify('Welcome to APP_NAME!');
    },

    locationList: ko.observableArray(),

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
                Octopus.locationList.push(new Location(item.venue));
            });

            MapView.render();
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
var LocationListViewModel = function () {
    var self = this;
    self.locationList = Octopus.locationList;
    self.handleClick = Octopus.animateLocationMarker;
};

var ViewModel = {
    LocationList: LocationListViewModel
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

        MapView.markersTable = {};
    },

    render: function () {
        Octopus.locationList().forEach(function (location) {
            var marker = new google.maps.Marker({
                position: location.position(),
                animation: null,
                // icon: location.iconUrl(),
                map: MapView.map
            });

            MapView.markersTable[location.name()] = marker;
        });
    }
};

// Initialize
Octopus.init();