(function () {

/**************************
 SETTINGS
 *************************/
var availableTickets = [
    {city: 'Barcelona', cost: 120},
    {city: 'Berlin', cost: 60},
    {city: 'London', cost: 50},
    {city: 'Oslo', cost: 100},
    {city: 'Stockholm', cost: 150},
    {city: 'Paris', cost: 100}
];
var priorityCost = 15;
var luggageCost = 20;

function isValidDestination(city, options) {
	console.log('city ' + city);
    return options.some(function(ticket) {
        return ticket.city.toLowerCase() === city.toLowerCase();
    });
}
function isValidEmail(email) {
	console.log('email ' + email);
    return /^[a-z0-9._-]+\@[a-z0-9._-]+\.[a-z0-9._-]+$/gi.test(email);
}

var Input = function(_condition, _errorText) {
	this.value = ko.observable("");

	this.error = ko.computed(function() {
		return !_condition(this.value());
	}, this);
	this.text = ko.computed(function() {
		return this.error() ? _errorText : "";
	}, this);
	this.class = ko.computed(function() {
		return this.error() ? "has-error" : "";
	}, this);
}

var AppViewModel = function() {

	var self = this;

	this.availableTickets = ko.observableArray([
	    {city: 'Barcelona', cost: 120},
	    {city: 'Berlin', cost: 60},
	    {city: 'London', cost: 50},
	    {city: 'Oslo', cost: 100},
	    {city: 'Stockholm', cost: 150},
	    {city: 'Paris', cost: 100}
	]);	

	this.seatId = ko.observable("");

	ko.bindingHandlers.seatChoose = {
		init: function(element) { //przetwarzany element, do ktorego jestesmy podpieci
			$(element).seatChooser(); //inicjalizacja pluginu, zapisuje referencje do siebie, zebysmy mogli sie do niego 
		},
		update: function(element, valueAccessor) {
			var value = valueAccessor();
			var valueUnwrapped = ko.unwrap(value);
			//console.log("Update: ", element, " valueAccessor: ", valueAccessor);
			$(element).data('plugin_seatChooser').setSeat(valueUnwrapped); //rozmawianie z pluginem, mowienie mu, ze zmienila sie wartosc
		}
	};

	this.passengerName = new Input(function(_value) {
		return _value.length>=2; 
	}, "Your name is too short");
	this.passengerSurname = new Input(function(_value) {
		return _value.length>=2; 
	}, "Your surname is too short");

	this.destination = new Input(function(_value) {
		return isValidDestination(_value, self.availableTickets());
	}, "Invalid destination");

	this.emailAddress = new Input(function(_value) {
		return isValidEmail(_value); 
	}, "Invalid email");

	this.inputs = [];
	this.inputs.push(this.passengerName);
	this.inputs.push(this.passengerSurname);

	this.departure = ko.observable("11-11-1111");
	this.seat = ko.observable("");
	this.luggage = ko.observable("");
	this.boarding = ko.observable("");
	this.accept = ko.observable("");

	this.destinationsSuggested = ko.computed(function() { 
         return this.availableTickets().filter(ifSuchGuestBooked);
    }, this);

    function ifSuchGuestBooked(ticket) {
        if (self.destination.value()==="") {
            return true;
        } else {
            return ticket.city.toLowerCase().indexOf(self.destination.value().toLowerCase()) >= 0;
        }
    }

    this.setDestination = function(ticket) {
    	console.log('aa');
    	self.destination.value(ticket.city);
    }


	this.submit = function() {
		for (var index in this.inputs) {
			var obj = this.inputs[index];
			console.log('status: ' + obj.status());
			if (!obj.status()) {
				console.log(obj.getText());
				setError(obj.jQueryObj, obj.errorText);
			} else {
				console.log("It's ok");
			}
		}
	}

	function setError(elem, text) {
    	// var $formGroup = $(elem).closest('.form-group, .checkbox');
    	// var $controlLabel = $formGroup.find('.control-label');

    	// if(!$controlLabel.length) {
     //    	$controlLabel = $('<label>').addClass('control-label');
     //    	$formGroup.find('label').after($controlLabel);
     //    }

     //    $formGroup.addClass('has-error');
     //    $controlLabel.text(text).show();
    }
}

ko.applyBindings(new AppViewModel());



})();