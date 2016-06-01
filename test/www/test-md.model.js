window.Model.User = md.model({
	name: 'User',
	props: ['name', 'profile', 'age', 'active']
});

window.Model.Note = md.model({
	name: 'Note',
	defaults: {
		title: 'Default Title',
		body: 'Default Note Body',
		author: new Model.User({
			name: 'User Default'
		})
	},
	refs: {
		author: 'User'
	}
});

console.dir(window.Model.User);
console.dir(window.Model.Note);

describe("md.model()", function() {
	"use strict";

	it("exists", function() {
		expect(md.model).to.exist;
	});

	it("is a function", function() {
		expect(md.model).to.be.a("function");
	});

	it("returns a Model Constructor", function() {
		var User = window.Model.User;
		expect(User.name).to.equal("Model");
		expect(User.prototype.__proto__).to.equal(md.__TEST__.BaseModel.prototype);
		expect(User).to.be.instanceof(md.__TEST__.ModelConstructor);
	});

	it("create sample model constructors (`User` and `Note`)", function() {
		console.log('Open `test-md.model.js` to see the model schemas.');
		expect(window.Model.User).to.exist;
		expect(window.Model.Note).to.exist;
	});

	it("throw error on missing name", function() {
		expect(function() {
			var ModelA = md.model({
				props: ['name']
			});
		}).to.throw(Error);
	});

	it("throw error on restricted props", function() {
		expect(function() {
			var ModelB = md.model({
				name: 'ModelB',
				props: ['url'] // `url` is reserved
			});
			var mdl = new ModelB();
		}).to.throw(Error);
	});

	it("correct url", function() {
		var ModelB = md.model({
			name: 'ModelB',
			url: '/modelb'
		});
		var mdl = new ModelB();
		expect(mdl.url()).to.equal('/modelb');
	});


});