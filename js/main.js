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

    var AppViewModel = function() {

        var self = this;
        this.canValidate = ko.observable(false);

        /**************************
         INPUT VARIABLES
         *************************/
        var Input = function(condition, errorText, defaultValue) {
            this.value = (typeof defaultValue !== "undefined") ? ko.observable(defaultValue) : ko.observable("");
            this.text = errorText;

            this.ifError = ko.computed(function() {
                return !condition(this.value());
            }, this);
            this.errorClass = ko.computed(function() {
                return (self.canValidate() && this.ifError()) ? "has-error" : "";
            }, this);
        };

        this.passengerName = new Input(function(value) {
            return value.length>=2;
        }, "Your name is too short");

        this.passengerSurname = new Input(function(value) {
            return value.length>=2;
        }, "Your surname is too short");

        this.destination = new Input(function(value) {
            return isValidDestination(value, availableTickets);
        }, "Invalid destination");

        this.emailAddress = new Input(function(value) {
            return isValidEmail(value);
        }, "Invalid email");

        this.departureDate = new Input(function(value) {
            return isValidDate(value);
        }, "Invalid date");

        this.seatId = new Input(function(value) {
            var seatChooser = $('#seat').data('plugin_seatChooser');
            return seatChooser && seatChooser.isValidSeat(value);
        }, "Invalid seat ID");

        this.luggage = new Input(function(value) {
            return true;
        }, "", 0);

        this.priority = new Input(function(value) {
            return true;
        }, "");

        this.accept = new Input(function(value) {
            return value;
        }, "You have to accept terms and conditions");

        /* Pushing all input variables into an array */
        this.inputs = [
            this.passengerName,
            this.passengerSurname,
            this.destination,
            this.emailAddress,
            this.departureDate,
            this.seatId,
            this.luggage,
            this.priority,
            this.accept
        ];

        /**************************
         COMPUTED VARIABLES
         *************************/
        this.totalCost = ko.computed(function() {
            return (this.priority.value() ? priorityCost : 0) + (this.luggage.value() * luggageCost) + getCostByCity(this.destination.value());
        }, this);

        /**************************
         CUSTOM BINDINGS
         *************************/
        ko.bindingHandlers.seatChoose = {
            init: function(element) {
                $(element).seatChooser();
                $(element).on('seatChanged', function() {
                    $(element).trigger('change');
                });
            }
        };
        ko.bindingHandlers.dateChoose = {
            init: function(element) {
                $(element).datepicker();
                $(element).on('changeDate', function() {
                    $(element).trigger('change');
                    $(element).data().datepicker.hide();
                });
            },
            update: function(element, valueAccessor) {
                var value = valueAccessor();
                var valueUnwrapped = ko.unwrap(value);
                $(element).data().datepicker.hide();
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
         HELPERS
         *************************/
        function ifSuchDestinationExist(ticket) {
            if (self.destination.value()==="") {
                return false;
            } else {
                var ticket = ticket.city.toLowerCase();
                var destination = self.destination.value().toLowerCase();
                return (ticket.indexOf(destination) >= 0 && destination.indexOf(ticket) < 0);
            }
        }

        /**************************
         BINDED FUNCTIONS
         *************************/
        this.setDestination = function(ticket) {
            self.destination.value(ticket.city);
        };
        this.submit = function() {
            this.canValidate(true);

            var formErrors = this.inputs.filter(function(field){
                return field.ifError();
            });
            if (formErrors.length===0) {
                $('#summaryModal').modal();
            }
        };
    };

    ko.applyBindings(new AppViewModel());

})();