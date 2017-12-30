var Notification = {
    message: null
};

var Octopus = {
    init: function () {
        MapView.init();
        NotificationView.init();
        Octopus.notify('Welcome to APP_NAME!');
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
    }
};

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
        MapView.render();
    },

    render: function () {
        var bangkok = {
            lat: 13.7248936,
            lng: 100.493025
        };
        var map = new google.maps.Map(
            $('.map').get(0), {
                center: bangkok,
                zoom: 13
            }
        );
    }
};

Octopus.init();
