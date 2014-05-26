(function () {

    /**************************
     SETTINGS
     *************************/
    var availableTickets = [
        {city: 'Barcelona', cost: 120, focus: false},
        {city: 'Berlin', cost: 60, focus: false},
        {city: 'London', cost: 50, focus: false},
        {city: 'Oslo', cost: 100, focus: false},
        {city: 'Stockholm', cost: 150, focus: false},
        {city: 'Paris', cost: 100, focus: false}
    ];
    var priorityCost = 15;
    var luggageCost = 20;

    /**************************
     FUNCTIONS
     *************************/
    function isValidDestination(city, options) {
        return options.some(function(ticket) {
            return ticket.city.toLowerCase() === city.toLowerCase();
        });
    }
    function isValidEmail(email) {
        return /^[a-z0-9._-]+\@[a-z0-9._-]+\.[a-z0-9._-]+$/gi.test(email);
    }
    function isValidDate(date) {
        var numbers = date.split('-');
        var date_picked = new Date(numbers[2], numbers[1]-1, numbers[0]);
        return (date!="") && (date_picked > new Date());
    }
    function getCostByCity(destination) {
        var ticket = availableTickets.filter(function(ticket){
            return (ticket.city === destination);
        });
        return (ticket.length) ? ticket[0].cost : 0;
    }

    ko.validation.init( {
        errorElementClass: 'has-error',
        errorMessageClass: 'has-error control-label',
        decorateInputElement: true
    } );

    var AppViewModel = function() {

        var self = this;

        this.form = {
            name : ko.observable().extend({ required: true, minLength: 3  }),
            surname : ko.observable().extend({ required: true, minLength: 3  }),
            email : ko.observable().extend({ required: true, minLength: 3  })
        }

        this.submit =  function () {
            var errors = ko.validation.group(self.form, { deep: true });
            if (errors().length==0) {
                console.log('Thank you.');
            } else {
                console.log('Please check your submission.');
                errors.showAllMessages();
            }
        }
    };

    ko.applyBindings(new AppViewModel());

})();