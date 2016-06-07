(function() {

	var redrawComponent = {
		count: 0,
		view: function() {
			return m("h2", "Count: " + (++this.count));
		}
	};

	m.mount(document.getElementById("redraw"), redrawComponent);

	describe("Redraw", function() {
		"use strict";

		it("only model instance", function() {
			var lastRedrawCount = redrawComponent.count;
			console.log(lastRedrawCount);
			// Models instance with redraw enabled
			var modelEnabled = new Model.User({
				name: 'Foo'
			}, {
				redraw: true
			});
			// Models instance with NO redraw enabled
			var modelDisabled = new Model.User({
				name: 'Foo'
			});
			// console.log(modelA);
			modelEnabled.name('Bar');
			modelDisabled.name('Bar');
		});

	});

})()