describe("Collection.<lodash>", function() {
	"use strict";

	it("size", function() {
		var col = new md.Collection();
		expect(col.size()).to.equal(0);
		var user = new Model.User();
		col.add(user);
		col.add(user);
		expect(col.size()).to.equal(1);
		col.remove(user);
		expect(col.size()).to.equal(0);
	});

	it("forEach", function() {
		var col = new md.Collection();
		var user = new Model.User();
		col.add(user);
		col.add(new Model.User());
		col.add(new Model.User());
		var loopCount = 0;
		var result = col.forEach(function(model) {
			expect(model).to.be.instanceof(Model.User);
			loopCount++;
		});
		expect(loopCount).to.be.equal(3);
		expect(result).to.be.a("array");
		expect(result.length).to.be.equal(3);
		expect(result[0]).to.be.equal(user.getJson());
	});

	it("map", function() {
		var col = new md.Collection();
		var userA = new Model.User();
		var userB = new Model.User();
		var userC = new Model.User();
		col.add(userA);
		col.add(userB);
		col.add(userC);
		var loopCount = 0;
		var result = col.map(function(model) {
			expect(model).to.be.instanceof(Model.User);
			loopCount++;
			return model.cid();
		});
		expect(loopCount).to.be.equal(3);
		expect(result).to.be.a("array");
		expect(result.length).to.be.equal(3);
		expect(result[0]).to.be.equal(userA.cid());
		expect(result[1]).to.be.equal(userB.cid());
		expect(result[2]).to.be.equal(userC.cid());
	});

	it("find", function() {
		var col = new md.Collection();
		var userA = new Model.User();
		userA.name('Foo');
		userA.active(false);
		col.add(userA);
		var userB = new Model.User();
		userB.name('Bar');
		userB.active(false);
		col.add(userB);
		var userC = new Model.User();
		userC.name('Baz');
		userC.active(true);
		col.add(userC);
		var result = col.find(['name', 'Foo']);
		expect(result).to.be.equal(userA);
		result = col.find('active');
		expect(result).to.be.equal(userC);
	});

	it("filter", function() {
		var col = new md.Collection();
		var userA = new Model.User();
		userA.name('Foo');
		userA.active(true);
		col.add(userA);
		var userB = new Model.User();
		userB.name('Bar');
		userB.active(false);
		col.add(userB);
		var userC = new Model.User();
		userC.name('Baz');
		userC.active(true);
		col.add(userC);
		var result = col.filter('active');
		expect(result).to.be.a("array");
		expect(result.length).to.equal(2);
		expect(result[0]).to.be.equal(userA);
		expect(result[1]).to.be.equal(userC);
	});

});