(function () {

	function Field(_selector, _validating) {
		this.jqueryObject = $(_selector);
		this.validateCondition = _validating;

	}

	var $destination = Field('#destination', function() {
		return isValidDestination(city);
	})

});