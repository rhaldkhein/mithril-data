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
		collection: PostB.createCollection(),
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
				m("div", this.collection.map(function(model, i) {
					i++;
					return m("h2", [
						"collection.modelB" + i + ".name (schema:PostB, instance:" + i + ") = ",
						m("span", {
							id: "col-modelb" + i + "-name"
						}, "" + model.name())
					])
				}))
			]);
		}
	};

	var elRedraw = document.getElementById("redraw");
	m.mount(elRedraw, redrawComponent);

	describe("Auto Redraw", function() {
		"use strict";


		describe("Model", function() {
			it("should redraw ALL instances - if redraw=true is set in `schema` option", function(done) {
				// Open `test-redraw.js` to see schema configuration.

				// First instance.
				var elemA1 = document.getElementById("modela1-name");
				var modelA1 = redrawComponent.modelA1;
				expect(elemA1.innerHTML).to.equal("undefined");

				// Second instance.
				var elemA2 = document.getElementById("modela2-name");
				var modelA2 = redrawComponent.modelA2;
				expect(elemA2.innerHTML).to.equal("undefined");

				modelA1.name('Foo');
				modelA2.name('Bar');

				// Need to delay and wait for DOM update.
				setTimeout(function() {
					expect(elemA1.innerHTML).to.equal("Foo");
					expect(elemA2.innerHTML).to.equal("Bar");
					done();
				}, 200);


			});

			it("should redraw ONLY centain instances - if redraw=true is set in `instance` option", function(done) {
				// Open `test-redraw.js` to see schema configuration.

				// First instance.
				var modelB1 = redrawComponent.modelB1;
				var elemB1 = document.getElementById("modelb1-name");
				expect(elemB1.innerHTML).to.equal("undefined");

				modelB1.name('Foo');

				// Need to delay and wait for DOM update.
				setTimeout(function() {
					expect(elemB1.innerHTML).to.equal("undefined");

					// Second instance.
					var modelB2 = redrawComponent.modelB2;
					var elemB2 = document.getElementById("modelb2-name");
					expect(elemB2.innerHTML).to.equal("undefined");

					// Set option here.
					modelB2.opt('redraw', true);
					modelB2.name('Bar');

					setTimeout(function() {
						expect(elemB2.innerHTML).to.equal("Bar");
						done();
					}, 200);
				}, 200);
			});
		});

		describe("Collection", function() {
			it("should redraw - even if contained model has false redraw", function(done) {
				var col = redrawComponent.collection;
				col.opt('redraw', true);

				var postB1 = new PostB();
				postB1.opt('redraw', false);
				col.add(postB1);

				var postB2 = new PostB();
				postB2.opt('redraw', false);
				col.add(postB2);

				postB1.name('Foo');
				postB2.name('Bar');

				setTimeout(function() {
					var elemB1 = document.getElementById("col-modelb1-name");
					expect(elemB1.innerHTML).to.equal("Foo");
					var elemB2 = document.getElementById("col-modelb2-name");
					expect(elemB2.innerHTML).to.equal("Bar");
					// Change model value
					postB1.name('Test');
					setTimeout(function() {
						var elemB1x = document.getElementById("col-modelb1-name");
						expect(elemB1x.innerHTML).to.equal("Test");
						done();
					}, 200);
				}, 200);

			});
		});

	});

})();