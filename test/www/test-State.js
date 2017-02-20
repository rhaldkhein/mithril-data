describe('State', function() {
	'use strict';

	var customStoreData = {};
	var customStore = function(initVal, key, factorykey) {
		var prefix = this.prefix || '';
		factorykey = factorykey ? (factorykey + '.') : '';
		key = prefix + factorykey + key;
		var prop = function(valNew) {
			if (arguments.length) {
				customStoreData[key] = valNew;
			} else {
				return customStoreData[key];
			}
		};
		if (!(key in customStoreData))
			prop(initVal);
		return prop;
	};

	it('Single instance', function() {
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

	it('Accepts fuctions initialized with md.stream()', function() {
		var _isDone = md.stream(false);
		var _test = md.stream('Foo');
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
		expect(state.isDone.constructor).to.be.equal(md.stream);

	});

	it('`toJson()` method', function() {
		var _isDone = md.stream(false);
		var _test = md.stream('Foo');
		var state = md.State.create({
			isDone: _isDone,
			test: _test
		});
		var json = state.toJson();
		expect(json.isDone).to.be.false;
		expect(json.test).to.be.equal('Foo');
	});

	it('Custom store / prop (non factory)', function() {
		var state = md.State.create({
			name: 'Foo',
			age: 25,
			active: false
		}, {
			store: customStore
		});
		expect(state.name()).to.equal(customStoreData.name).and.to.equal('Foo');
		expect(state.age()).to.equal(customStoreData.age).and.to.equal(25);
		expect(state.active()).to.equal(customStoreData.active).and.to.equal(false);
	});

	it('Custom store / prop with prefix (non factory)', function() {
		var state = md.State.create({
			name: 'Foo',
			age: 25
		}, {
			prefix: 'pref.',
			store: customStore
		});
		expect(state.name()).to.equal(customStoreData['pref.name']).and.to.equal('Foo');
		expect(state.age()).to.equal(customStoreData['pref.age']).and.to.equal(25);
	});

	it('Custom store / prop with prefix (factory)', function() {
		var stateFactory = new md.State({
			name: 'Foo',
			age: 25
		}, {
			prefix: 'pref.',
			store: customStore
		});
		var stateA = stateFactory.set('a');
		expect(stateA.name()).to.equal(customStoreData['pref.a.name']).and.to.equal('Foo');
		expect(stateA.age()).to.equal(customStoreData['pref.a.age']).and.to.equal(25);
	});

});