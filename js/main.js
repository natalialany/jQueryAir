(function() {

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
        var ticket = availableTickets.filter(function(ticket) {
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
                var val = $(element).val();
                $(this).attr('value', val).trigger('change');
            });
        },
        update: function(element, valueAccessor, allBindingsAccessor) {
            var value = valueAccessor();
            var valueUnwrapped = ko.unwrap(value);
            $(element).data('plugin_seatChooser').setSeat(valueUnwrapped);
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
    ko.bindingHandlers.custom_typeahead = {
        init: function(element) {
            $(element).typeahead({
                source: function(query, callback) {
                    query = query.toLowerCase();

                    var result = availableTickets.filter(function(ticket) {
                        return (ticket.city.toLowerCase().indexOf(query) !== -1);
                    }).map(function(ticket) {
                            return ticket.city;
                        });

                    callback(result);
                }
            });
        }
    }

    /**************************
     Knockout Validation - defining custom rules
     *************************/
    ko.validation.init({
        errorElementClass: 'has-error',
        errorMessageClass: 'control-label',
        decorateInputElement: true
    });
    ko.validation.rules['custom_validateDestination'] = {
        validator: function(city, options) {
            console.log('custom_validateDestination');
            return (city === undefined) || options.some(function(ticket) {
                return ticket.city.toLowerCase() === city.toLowerCase();
            });
        },
        message: 'Invalid destination'
    };
    ko.validation.rules['custom_validateDate'] = {
        validator: function(date) {
            console.log('custom_validateDate');
            var numbers = date.split('-');
            var date_picked = new Date(numbers[2], numbers[1] - 1, numbers[0]);
            return (date != "") && (date_picked > new Date());
        },
        message: 'Chosen date is in the past'
    };
    ko.validation.registerExtenders();

    /**************************
     App View Model
     *************************/
    var AppViewModel = function() {

        this.form = {
            name: ko.observable().extend({ required: true, minLength: 2  }),
            surname: ko.observable().extend({ required: true, minLength: 2  }),
            email: ko.observable().extend({ required: true, email: true }),
            accept: ko.observable().extend({ equal: { params: true, message: 'You have to accept terms and conditions' }}),
            destination: ko.observable().extend({ required: true, custom_validateDestination: availableTickets }),
            date: ko.observable().extend({ required: true, pattern: { params: /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/, message: 'Invalid date format' }, custom_validateDate: null }),
            seat: ko.observable('').extend({ required: true, pattern: { params: /^(0?[1-9]|1[0-9]|2[0-5])[A-F]$/, message: 'Invalid seat format' } }),
            luggage: ko.observable(0),
            priority: ko.observable(false)
        }
        this.fullName = ko.computed(function() {
            return this.form.name() + ' ' + this.form.surname();
        }, this);
        this.totalCost = ko.computed(function() {
            return (this.form.priority() ? priorityCost : 0) + (this.form.luggage() * luggageCost) + getCostByCity(this.form.destination());
        }, this);

        /**************************
         Submit
         *************************/
        this.submit = function() {
            var errors = ko.validation.group(this.form, { deep: true });
            if (errors().length == 0) {
                $('#summaryModal').modal();
            } else {
                errors.showAllMessages();
            }
        }
    };

    ko.applyBindings(new AppViewModel());

})();