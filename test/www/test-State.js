describe("State", function() {
	"use strict";

	it("Sing instance", function() {
		var state = md.State.create({
			isEditing: false,
			test: 'Foo'
		});
		expect(state.isEditing()).to.be.false;
		expect(state.test()).to.be.equal('Foo');
		state.isEditing(true);
		state.test('Bar');
		expect(state.isEditing()).to.be.true;
		expect(state.test()).to.be.equal('Bar');
	});

});