describe("Model Constructor", function() {
	"use strict";

	var User = window.Model.User;

	it("is a constructor function", function() {
		expect(User).to.be.a("function");
	});

	it("has `modelOptions` property", function() {
		expect(User).to.have.property('modelOptions');
	});

	it("`modelOptions` has `name` property with type of string", function() {
		expect(User.modelOptions).to.have.property('name');
		expect(User.modelOptions.name).to.be.a('string');
	});

	it("`modelOptions` has `props` property with type of array of strings", function() {
		expect(User.modelOptions).to.have.property('props');
		expect(User.modelOptions.props).to.be.a('array');
		expect(User.modelOptions.props[0]).to.be.a('string');
	});

	it("has `createCollection` function that returns new instance of `md.Collection` with model set to this constructor", function() {
		expect(User).to.have.property('createCollection');
		var userCollection = User.createCollection();
		expect(userCollection).to.be.an.instanceof(md.Collection);
		expect(userCollection.__options.model).to.exist;
		expect(userCollection.__options.model).to.equal(User);
	});

});