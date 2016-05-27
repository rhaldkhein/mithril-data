describe("Model.<lodash>", function() {
	"use strict";

	it("has()", function() {
		var user = new Model.User();
		expect(user.has).to.exist;
		expect(user.has('name')).to.equal(true);
	})

	it("keys()", function() {
		var user = new Model.User();
		expect(user.keys).to.exist;
		var props = Model.User.modelOptions.props;
		var keys = user.keys();
		for (var i = 0; i < props.length; i++) {
			expect(keys).to.contain(props[i]);
		}
	})

	it("values()", function() {
		var user = new Model.User();
		expect(user.values).to.exist;
		user.name('Test');
		var props = Model.User.modelOptions.props;
		var values = user.values();
		for (var i = 0; i < props.length; i++) {
			expect(values).to.contain(user[props[i]]());
		}
	})

	it("pick()", function() {
		var user = new Model.User();
		expect(user.pick).to.exist;
		user.name('Name');
		user.profile('Profile');
		var picked = user.pick(['profile']);
		expect(picked.profile).to.exist;
		expect(picked.profile).to.equal(user.profile());
	})

});