describe("State", function() {
	"use strict";

	it("Single instance", function() {
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

	it("Accepts fuctions initialized with m.prop()", function() {
		var _isDone = m.prop(false);
		var _test = m.prop('Foo');
		var state = md.State.create({
			isDone: _isDone,
			test: _test
		});
		expect(state.isDone()).to.be.false;
		expect(state.test()).to.be.equal('Foo');
		state.isDone(true);
		state.test('Bar');
		expect(state.isDone()).to.be.true;
		expect(state.test()).to.be.equal('Bar');
	});

	it("`toJson()` method", function() {
		var _isDone = m.prop(false);
		var _test = m.prop('Foo');
		var state = md.State.create({
			isDone: _isDone,
			test: _test
		});
		var json = state.toJson();
		expect(json.isDone).to.be.false;
		expect(json.test).to.be.equal('Foo');
	});

});