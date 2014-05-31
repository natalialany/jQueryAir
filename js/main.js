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
    function getCostByCity(destination) {
        var ticket = availableTickets.filter(function(ticket){
            return (ticket.city === destination);
        });
        return (ticket.length) ? ticket[0].cost : 0;
    }

    /**************************
     CUSTOM BINDINGS
     *************************/
    ko.bindingHandlers.custom_seat = {
        init: function(element) {
            $(element).seatChooser();
            $(element).on('seatChanged', function() {
                console.log('aaaaa');
                $(element).trigger('change');
            });
        }
    };
    ko.bindingHandlers.custom_date = {
        init: function(element) {
            $(element).datepicker();
            $(element).on('changeDate', function() {
                $(element).trigger('change');
                $(element).data().datepicker.hide();
            });
        }
    };
    ko.bindingHandlers.custom_typeahead  = {
        init: function(element) {
            $(element).typeahead({
                source: function(query, callback) {
                    query = query.toLowerCase();

                    var result = availableTickets.filter(function(ticket) {
                        return (ticket.city.toLowerCase().indexOf(query) !== -1);
                    }).map(function(ticket){
                            return ticket.city;
                        });

                    callback(result);
                }
            });
        }
    }

    /**************************
     Knockout Validation plugin
     *************************/
    /* Setup */
    ko.validation.init( {
        errorElementClass: 'has-error',
        errorMessageClass: 'control-label',
        decorateInputElement: true
    } );
    /* Custom rules */
    ko.validation.rules['custom_validateDestination'] = {
        validator: function (city, options) {
            console.log('custom_validateDestination');
            return (city===undefined) || options.some(function(ticket) {
                return ticket.city.toLowerCase() === city.toLowerCase();
            });
        },
        message: 'Invalid destination'
    };
    ko.validation.rules['custom_validateDate'] = {
        validator: function(date) {
            console.log('custom_validateDate');
            var numbers = date.split('-');
            var date_picked = new Date(numbers[2], numbers[1]-1, numbers[0]);
            return (date!="") && (date_picked > new Date());
        },
        message: 'Invalid date'
    };
    ko.validation.registerExtenders();

    var AppViewModel = function() {

        var self = this;

        this.form = {
            name : ko.observable().extend({ required: true, minLength: 2  }),
            surname : ko.observable().extend({ required: true, minLength: 2  }),
            email : ko.observable().extend({ required: true, email: true }),
            accept : ko.observable().extend({ equal: { params: true, message:'You have to accept terms and conditions' }}),
            destination : ko.observable().extend({ required: true, custom_validateDestination: availableTickets }),
            date: ko.observable().extend({ required: true, custom_validateDate: 0 }),
            seat: ko.observable().extend({ required: true })
        }
        this.luggage = ko.observable(0);
        this.priority = ko.observable(false);
        this.totalCost = ko.computed(function() {
            return (this.priority() ? priorityCost : 0) + (this.luggage() * luggageCost); // + getCostByCity(this.destination.value());
        }, this);

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