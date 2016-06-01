describe("md.config > baseUrl", function() {
	"use strict";

	it("prepend to `url()` method of Model and Collection", function() {
		md.config({
			baseUrl: '/base'
		});
		// For model
		var user = new Model.User();
		expect(user.url()).to.equal('/base/user');
		// For collection without model.
		var colA = new md.Collection();
		expect(colA.url()).to.equal('/base');
		// For collection with model.
		var colB = new md.Collection({
			model: Model.User
		});
		expect(colB.url()).to.equal('/base/user');
		// For model with custom url.
		var ModelConfigBaseUrl = md.model({
			name: 'ModelConfigBaseUrl',
			url: '/customurl'
		})
		var mdl = new ModelConfigBaseUrl();
		expect(mdl.url()).to.equal('/base/customurl');
	});

});