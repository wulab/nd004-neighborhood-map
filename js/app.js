var model = {

};

var octopus = {
    init: function() {
        view.init();
    }
};

var view = {
    init: function() {
        view.render();
    },

    render: function() {
        console.log('view rendered');
    }
};

octopus.init();
