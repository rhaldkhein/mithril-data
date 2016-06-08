(function() {

	var PostA = md.model({
		name: 'PostA',
		props: ['name'],
		redraw: true
	});

	var PostB = md.model({
		name: 'PostB',
		props: ['name']
	});

	var redrawComponent = {
		count: 0,
		modelA1: new PostA(),
		modelA2: new PostA(),
		modelB1: new PostB(),
		modelB2: new PostB(),
		view: function() {
			return m("div", [
				m("h2", "count = " + (++this.count)),
				m("h2", [
					"modelA1.name (schema:PostA, instance:1) = ",
					m("span", {
						id: "modela1-name"
					}, "" + this.modelA1.name())
				]),
				m("h2", [
					"modelA2.name (schema:PostA, instance:2) = ",
					m("span", {
						id: "modela2-name"
					}, "" + this.modelA2.name())
				]),
				m("h2", [
					"modelB1.name (schema:PostB, instance:1) = ",
					m("span", {
						id: "modelb1-name"
					}, "" + this.modelB1.name())
				]),
				m("h2", [
					"modelB2.name (schema:PostB, instance:2) = ",
					m("span", {
						id: "modelb2-name"
					}, "" + this.modelB2.name())
				]),
			]);
		}
	};

	m.mount(document.getElementById("redraw"), redrawComponent);

	describe("Redraw", function() {
		"use strict";

		it("should redraw ALL instances - if redraw=true is set in `schema` option", function(done) {
			// Open `test-redraw.js` to see schema configuration.
			var doneCount = 0;
			var fnDone = function() {
				if (++doneCount >= 2)
					done();
			};
			// First instance.
			var modelA1 = redrawComponent.modelA1;
			var elemA1 = document.getElementById("modela1-name");
			expect(elemA1.innerHTML).to.equal("undefined");
			modelA1.name('Foo');
			setTimeout(function() {
				// Successfully updated the element.
				expect(elemA1.innerHTML).to.equal("Foo");
				fnDone();
				// Need to delay and wait for DOM update.
			}, 500);
			// Second instance. ------------------------------------
			var modelA2 = redrawComponent.modelA2;
			var elemA2 = document.getElementById("modela2-name");
			expect(elemA2.innerHTML).to.equal("undefined");
			modelA2.name('Bar');
			setTimeout(function() {
				// Successfully updated the element.
				expect(elemA2.innerHTML).to.equal("Bar");
				fnDone();
				// Need to delay and wait for DOM update.
			}, 500);
		});

		it("should redraw ONLY the instance - if redraw=true is set in `instance` option", function(done) {
			// Open `test-redraw.js` to see schema configuration.
			var doneCount = 0;
			var fnDone = function() {
				if (++doneCount >= 2)
					done();
			};
			// First instance.
			var modelB1 = redrawComponent.modelB1;
			var elemB1 = document.getElementById("modelb1-name");
			expect(elemB1.innerHTML).to.equal("undefined");
			modelB1.name('Foo');
			setTimeout(function() {
				// Should still be undefined
				expect(elemB1.innerHTML).to.equal("undefined");
				fnDone();
				// Second instance. ------------------------------------
				var modelB2 = redrawComponent.modelB2;
				var elemB2 = document.getElementById("modelb2-name");
				expect(elemB2.innerHTML).to.equal("undefined");
				// Set option here.
				modelB2.opt('redraw', true);
				modelB2.name('Bar');
				setTimeout(function() {
					// Should be updated
					expect(elemB2.innerHTML).to.equal("Bar");
					fnDone();
					// Need to delay and wait for DOM update.
				}, 500);
			}, 500);
			// Need to delay and wait for DOM update.
		});

	});

})();