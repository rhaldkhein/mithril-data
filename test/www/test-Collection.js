describe('Collection Instance', function() {
	'use strict';

	it('is instance of `Collection`', function() {
		var col = new md.Collection();
		expect(col).to.be.instanceof(md.Collection);
	});

	it('is instance of `Collection` with options', function() {
		var col = new md.Collection({
			test: 'test'
		});
		expect(col).to.be.instanceof(md.Collection);
		expect(col.__options.test).to.be.equal('test');
	});

	it('state - by object and array and instance', function() {
		// By array
		var colA = new md.Collection({
			state: ['a', 'b']
		});
		var userA = new Model.User();
		colA.add(userA);
		expect(colA.stateOf(userA).a()).to.be.undefined;
		// By object
		var colB = new md.Collection({
			state: {
				x: 123,
				y: 456
			}
		});
		var userB = new Model.User();
		colB.add(userB);
		expect(colB.stateOf(userB).x()).to.be.equal(123);
		// By Instance
		var colC = new md.Collection({
			state: new md.State(['name'])
		});
		var userC = new Model.User();
		colC.add(userC);
		expect(colC.stateOf(userC).name()).to.be.undefined;
	});

	it('state - set and get and remove', function() {
		// By object
		var colB = new md.Collection({
			state: {
				x: 123,
				y: 456
			}
		});
		var userB = new Model.User();
		var userC = new Model.User();
		colB.add(userB);
		colB.add(userC);
		expect(colB.stateOf(userB).x()).to.be.equal(123);
		// Set
		colB.stateOf(userB).x(789);
		colB.stateOf(userC).x(258);
		// Get
		expect(colB.stateOf(userB).x()).to.be.equal(789);
		expect(colB.stateOf(userC).x()).to.be.equal(258);
		// Remove
		colB.remove(userC);
		expect(colB.stateOf(userC)).to.be.undefined;
	});

});

describe('Collection.<properties>', function() {
	'use strict';

	it('`models` exist with value type of array', function() {
		var col = new md.Collection();
		expect(col.models).to.exist.and.to.be.a('array');
	});

	it('`__options` exist with value type of object', function() {
		var col = new md.Collection();
		expect(col.__options).to.exist.and.to.be.a('object');
	});

});

describe('Collection.<methods>', function() {
	'use strict';

	describe('#opt()', function() {
		'use strict';

		it('set options by plain object', function() {
			var col = new md.Collection();
			col.opt({
				test: 'test'
			});
			expect(col.__options.test).to.be.equal('test');
		});

		it('set options by key/value`', function() {
			var col = new md.Collection();
			col.opt('key', 'value');
			expect(col.__options.key).to.be.equal('value');
		});

		it('defaults to boolean true', function() {
			var col = new md.Collection();
			col.opt('key');
			expect(col.__options.key).to.be.equal(true);
		});

		it('can set falsy except `undefined`', function() {
			var col = new md.Collection();
			col.opt('key', false);
			expect(col.__options.key).to.be.false;
		});

	});

	describe('#add()', function() {
		'use strict';

		it('throw error if argument 1 is NOT instanceof of `BaseModel`', function() {
			var col = new md.Collection({
				model: Model.User
			});
			expect(function() {
				col.add('Not A BaseModel');
			}).to.throw(Error);
		});

		it('throw error if argument 1 is NOT instanceof of model specified', function() {
			var col = new md.Collection({
				model: Model.User
			});
			expect(function() {
				col.add(new Model.Note);
			}).to.throw(Error);
		});

		it('successfully add a model (push)', function() {
			var col = new md.Collection({
				model: Model.User
			});
			var user = new Model.User();
			col.add(user);
			col.add(user); // Should not add if existing.
			expect(col.models.length).to.equal(1);
			expect(col.models).to.contain(user.__json);
		});

		it('successfully add a model at the beginning (unshift)', function() {
			var col = new md.Collection({
				model: Model.User
			});
			var userA = new Model.User();
			col.add(userA);
			var userB = new Model.User();
			col.add(userB);
			var userC = new Model.User();
			col.add(userC, true);
			expect(col.models.length).to.equal(3);
			expect(col.models[0]).to.equal(userC.__json);
		});

	});

	describe('#addAll()', function() {
		'use strict';

		it('successfully add all models (push)', function() {
			var col = new md.Collection({
				model: Model.User
			});
			var userA = new Model.User();
			var userB = new Model.User();
			var userC = new Model.User();
			col.addAll([userA, userB, userC]);
			expect(col.models.length).to.equal(3);
			expect(col.models[0]).to.equal(userA.__json);
			expect(col.models[1]).to.equal(userB.__json);
			expect(col.models[2]).to.equal(userC.__json);
		});

		it('successfully add all models at the beginning (unshift)', function() {
			var col = new md.Collection({
				model: Model.User
			});
			var userA = new Model.User();
			var userB = new Model.User();
			var userC = new Model.User();
			var userD = new Model.User();
			col.addAll([userA, userB]);
			col.addAll([userC, userD], true);
			expect(col.models.length).to.equal(4);
			expect(col.models[0]).to.equal(userD.__json);
			expect(col.models[1]).to.equal(userC.__json);
		});

	});

	describe('#create()', function() {
		'use strict';

		it('by single model data', function() {
			var col = new md.Collection({
				model: Model.User
			});
			col.create({
				name: 'Foo',
			});
			expect(col.models.length).to.be.equal(1);
			expect(col.models[0].name).to.be.equal('Foo');
		});

		it('by multiple model data', function() {
			var col = new md.Collection({
				model: Model.User
			});
			col.create([{
				name: 'Foo',
			}, {
				name: 'Bar',
			}]);
			expect(col.models.length).to.be.equal(2);
			expect(col.models[0].name).to.be.equal('Foo');
			expect(col.models[1].name).to.be.equal('Bar');
		});

		it('do not create if no associated model', function() {
			var col = new md.Collection();
			col.create([{
				name: 'Foo',
			}, {
				name: 'Bar',
			}]);
			expect(col.models.length).to.be.equal(0);
		});

		it('return newly created models', function() {
			var col = new md.Collection({
				model: Model.User
			});
			var user = new Model.User({
				id: '111'
			});
			col.add(user);
			var result = col.create([{
				id: '222'
			}, {
				id: '111'
			}]);
			expect(result.length).to.equal(1);
			expect(result[0].id()).to.equal('222');
		});

	});

	describe('#get()', function() {
		'use strict';

		it('get correct model by id', function() {
			var col = new md.Collection({
				model: Model.User
			});
			col.add(new Model.User({
				id: 'Foo'
			}));
			col.add(new Model.User({
				id: 'Bar'
			}));
			var user = new Model.User({
				id: 'Baz'
			});
			col.add(user);
			col.add(new Model.User({
				id: 'Test'
			}));

			var result = col.get('Baz');
			expect(result).to.equal(user);
		});

		it('get correct model by plain object', function() {
			var col = new md.Collection({
				model: Model.User
			});
			col.add(new Model.User({
				name: 'Foo'
			}));
			col.add(new Model.User({
				name: 'Bar'
			}));
			col.add(new Model.User({
				name: 'Baz',
				profile: 'Aaa'
			}));
			var user = new Model.User({
				name: 'Baz',
				profile: 'Bbb'
			});
			col.add(user);
			var result = col.get({
				name: 'Baz',
				profile: 'Bbb'
			});
			expect(result).to.equal(user);
		});

		it('get correct model by property (array)', function() {
			var col = new md.Collection({
				model: Model.User
			});
			col.add(new Model.User({
				name: 'Foo'
			}));
			col.add(new Model.User({
				name: 'Bar'
			}));
			col.add(new Model.User({
				name: 'Baz',
				profile: 'Aaa'
			}));
			var user = new Model.User({
				name: 'Baz',
				profile: 'Bbb'
			});
			col.add(user);
			var result = col.get(['profile', 'Bbb']);
			expect(result).to.equal(user);
		});

		it('get correct model by existing model', function() {
			var col = new md.Collection({
				model: Model.User
			});
			col.add(new Model.User({
				name: 'Foo'
			}));
			col.add(new Model.User({
				name: 'Bar'
			}));
			var user = new Model.User({
				name: 'Baz'
			});
			col.add(user);
			col.add(new Model.User({
				name: 'Test'
			}));
			var existing = user;
			var result = col.get(existing);
			expect(result).to.equal(user);
		});

		it('get correct model by function', function() {
			var col = new md.Collection({
				model: Model.User
			});
			col.add(new Model.User({
				name: 'Foo'
			}));
			col.add(new Model.User({
				name: 'Bar'
			}));
			var user = new Model.User({
				name: 'Baz'
			});
			col.add(user);
			col.add(new Model.User({
				name: 'Test'
			}));
			var result = col.get(function(model) {
				return model.name() === 'Baz';
			});
			expect(result).to.equal(user);
		});

		it('get undefined', function() {
			var col = new md.Collection({
				model: Model.User
			});
			col.add(new Model.User({
				id: 'Aaa',
				name: 'Foo'
			}));
			col.add(new Model.User({
				id: 'Bbb',
				name: 'Bar'
			}));
			// Id not found.
			var result = col.get('Ccc');
			expect(result).to.be.undefined;
			// Value not found.
			result = col.get({
				name: 'Test'
			});
			expect(result).to.be.undefined;
			// Model not found.
			var notExist = new Model.User();
			result = col.get(notExist);
			expect(result).to.be.undefined;
		});

	});

	describe('#getAll()', function() {
		'use strict';

		it('get all correct models by id', function() {
			var col = new md.Collection({
				model: Model.User
			});
			var userA = new Model.User({
				id: '111',
				name: 'Foo',
				active: false
			});
			col.add(userA);
			var userB = new Model.User({
				id: '222',
				name: 'Bar',
				active: true
			});
			col.add(userB);
			var userC = new Model.User({
				id: '333',
				name: 'Baz',
				active: false
			});
			col.add(userC);
			var userD = new Model.User({
				id: '444',
				name: 'Test',
				active: true
			});
			col.add(userD);
			var result = col.getAll(['222', '444']);
			expect(result.length).to.equal(2);
			expect(result[0]).to.be.equal(userB);
			expect(result[1]).to.be.equal(userD);
		});

		it('get all correct models by plain object', function() {
			var col = new md.Collection({
				model: Model.User
			});
			var userA = new Model.User({
				id: '111',
				name: 'Foo',
				active: false
			});
			col.add(userA);
			var userB = new Model.User({
				id: '222',
				name: 'Bar',
				active: true
			});
			col.add(userB);
			var userC = new Model.User({
				id: '333',
				name: 'Baz',
				active: false
			});
			col.add(userC);
			var userD = new Model.User({
				id: '444',
				name: 'Test',
				active: true
			});
			col.add(userD);

			var result = col.getAll([{
				name: 'Bar'
			}, {
				name: 'Test'
			}]);
			expect(result.length).to.equal(2);
			expect(result[0]).to.be.equal(userB);
			expect(result[1]).to.be.equal(userD);
		});

	});

	describe('#remove()', function() {
		'use strict';

		it('successful remove', function() {
			var col = new md.Collection({
				model: Model.User
			});
			var userA = new Model.User({
				id: '111',
				name: 'Foo',
				active: false
			});
			var userB = new Model.User({
				id: '222',
				name: 'Bar',
				active: true
			});
			var userC = new Model.User({
				id: '333',
				name: 'Baz',
				active: false
			});
			var userD = new Model.User({
				id: '444',
				name: 'Test',
				active: true
			});
			var userE = new Model.User({
				id: '555',
				name: 'Hello',
				active: false
			});
			col.add(userA);
			col.add(userB);
			col.add(userC);
			col.add(userD);
			col.add(userE);
			// Remove by ID
			col.remove('333');
			expect(col.models.length).to.equal(4);
			expect(col.models).to.not.contain(userC);
			// Remove by plain object
			col.remove({
				active: true
			});
			expect(col.models.length).to.equal(2);
			expect(col.models).to.not.contain(userB);
			expect(col.models).to.not.contain(userD);
		});

		it('successful remove by array', function() {
			var col = new md.Collection({
				model: Model.User
			});
			var userA = new Model.User({
				id: '111',
				name: 'Foo',
				active: false
			});
			var userB = new Model.User({
				id: '222',
				name: 'Bar',
				active: true
			});
			var userC = new Model.User({
				id: '333',
				name: 'Baz',
				active: false
			});
			var userD = new Model.User({
				id: '444',
				name: 'Test',
				active: true
			});
			var userE = new Model.User({
				id: '555',
				name: 'Hello',
				active: false
			});
			col.add(userA);
			col.add(userB);
			col.add(userC);
			col.add(userD);
			col.add(userE);
			// Remove by ID
			col.remove(['333', '555']);
			expect(col.models.length).to.equal(3);
			expect(col.models).to.not.contain(userC);
			expect(col.models).to.not.contain(userE);
		});

		it('return correct boolean', function() {
			var col = new md.Collection({
				model: Model.User
			});
			var userA = new Model.User({
				id: '111',
			});
			var userB = new Model.User({
				id: '222',
			});
			col.add(userA);
			col.add(userB);
			expect(col.remove('111')).to.equal(true);
			expect(col.remove('333')).to.equal(false);
		});

		it('removed model should not contain this collection', function() {
			var col = new md.Collection({
				model: Model.User
			});
			var userA = new Model.User({
				id: '111',
			});
			col.add(userA);
			expect(userA.__collections).to.contain(col);
			col.remove('111')
			expect(userA.__collections).to.not.contain(col);
		});

	});

	describe('#push()', function() {
		'use strict';

		it('successful push', function() {
			var col = new md.Collection({
				model: Model.User
			});
			var userA = new Model.User();
			col.add(userA);
			// Push by single model
			var userB = new Model.User();
			col.push(userB);
			// Push by multiple model
			var userC = new Model.User();
			var userD = new Model.User();
			expect(col.push([userC, userD])).to.equal(true);
			expect(col.models.length).to.equal(4);
			expect(col.models[0]).to.equal(userA.__json);
			expect(col.models[1]).to.equal(userB.__json);
			expect(col.models[2]).to.equal(userC.__json);
			expect(col.models[3]).to.equal(userD.__json);
		});

	});

	describe('#unshift()', function() {
		'use strict';

		it('successful unshift', function() {
			var col = new md.Collection({
				model: Model.User
			});
			var userA = new Model.User();
			col.add(userA);
			// Push by single model
			var userB = new Model.User();
			col.unshift(userB);
			// Push by multiple model
			var userC = new Model.User();
			var userD = new Model.User();
			expect(col.unshift([userC, userD])).to.equal(true);
			expect(col.models.length).to.equal(4);
			expect(col.models[3]).to.equal(userA.__json);
			expect(col.models[2]).to.equal(userB.__json);
			expect(col.models[1]).to.equal(userC.__json);
			expect(col.models[0]).to.equal(userD.__json);
		});

	});

	describe('#shift()', function() {
		'use strict';

		it('successful shift', function() {
			var col = new md.Collection({
				model: Model.User
			});
			var userA = new Model.User();
			var userB = new Model.User();
			var userC = new Model.User();
			var userD = new Model.User();
			col.addAll([userA, userB, userC, userD]);
			expect(col.shift()).to.equal(userA);
			expect(col.models.length).to.equal(3);
		});

	});

	describe('#pop()', function() {
		'use strict';

		it('successful pop', function() {
			var col = new md.Collection({
				model: Model.User
			});
			var userA = new Model.User();
			var userB = new Model.User();
			var userC = new Model.User();
			var userD = new Model.User();
			col.addAll([userA, userB, userC, userD]);
			expect(col.pop()).to.equal(userD);
			expect(col.models.length).to.equal(3);
		});

	});

	describe('#clear()', function() {
		'use strict';

		it('successful clear', function() {
			var col = new md.Collection({
				model: Model.User
			});
			var userA = new Model.User();
			var userB = new Model.User();
			var userC = new Model.User();
			var userD = new Model.User();
			col.addAll([userA, userB, userC, userD]);
			expect(col.clear()).to.equal(true);
			expect(col.models.length).to.equal(0);
		});

	});

	describe('#pluck()', function() {
		'use strict';

		it('successful pluck', function() {
			var col = new md.Collection({
				model: Model.User
			});
			var userA = new Model.User({
				name: 'Foo'
			});
			var userB = new Model.User({
				name: 'Bar'
			});
			var userC = new Model.User({
				name: 'Baz'
			});
			var userD = new Model.User({
				name: 'Test'
			});
			col.addAll([userA, userB, userC, userD]);
			var result = col.pluck('name');
			expect(result.length).to.equal(4);
			expect(result[0]).to.be.equal('Foo');
			expect(result[1]).to.be.equal('Bar');
			expect(result[2]).to.be.equal('Baz');
			expect(result[3]).to.be.equal('Test');
		});

		it('successful pluck by id', function() {
			var col = new md.Collection({
				model: Model.User
			});
			var userA = new Model.User({
				id: 'Foo'
			});
			var userB = new Model.User({
				id: 'Bar'
			});
			var userC = new Model.User({
				id: 'Baz'
			});
			var userD = new Model.User({
				id: 'Test'
			});
			col.addAll([userA, userB, userC, userD]);
			var result = col.pluck('id');
			expect(result.length).to.equal(4);
			expect(result[0]).to.be.equal('Foo');
			expect(result[1]).to.be.equal('Bar');
			expect(result[2]).to.be.equal('Baz');
			expect(result[3]).to.be.equal('Test');
		});

	});

	describe('#contains()', function() {
		'use strict';

		var col;
		var userA;

		before(function() {
			col = new md.Collection({
				model: Model.User
			});
			userA = new Model.User({
				id: '123',
				name: 'Foo'
			});
			var userB = new Model.User({
				id: '456',
				name: 'Bar'
			});
			var userC = new Model.User({
				id: '789',
				name: 'Baz'
			});
			var userD = new Model.User({
				id: '109',
				name: 'Test'
			});
			col.addAll([userA, userB, userC, userD]);
		});

		it('by id', function() {
			expect(col.contains('456')).to.be.true;
			expect(col.contains('XXX')).to.be.false;
		});

		it('by plain object', function() {
			expect(col.contains({
				name: 'Baz'
			})).to.be.true;
			expect(col.contains({
				name: 'Boo'
			})).to.be.false;
		});

		it('by model instance', function() {
			expect(col.contains(userA)).to.be.true;
			expect(col.contains(new Model.User())).to.be.false;
		});

	});

	describe('#sort(), #reverse(), #randomize()', function() {
		'use strict';

		var col = new md.Collection();

		before(function() {
			col.add(new Model.User({
				name: 'Foo',
				age: 2,
				active: true
			}));
			col.add(new Model.User({
				name: 'Bar',
				age: 3,
				active: false
			}));
			col.add(new Model.User({
				name: 'Zoo',
				age: 1,
				active: true
			}));
			col.add(new Model.User({
				name: 'Jar',
				age: 5,
				active: false
			}));
			col.add(new Model.User({
				name: 'Dog',
				age: 4,
				active: true
			}));
		});

		it('sort with no order specified - used default order', function() {
			col.sort('name');
			expect(col.size()).to.be.equal(5);
			expect(col.nth(0).name()).to.be.equal('Bar');
			expect(col.nth(1).name()).to.be.equal('Dog');
			expect(col.nth(2).name()).to.be.equal('Foo');
			expect(col.nth(3).name()).to.be.equal('Jar');
			expect(col.nth(4).name()).to.be.equal('Zoo');
		});

		it('sort with order is specified', function() {
			// Note that age is used, but name is used to compare
			col.sort('age', 'desc');
			expect(col.size()).to.be.equal(5);
			expect(col.nth(0).name()).to.be.equal('Jar');
			expect(col.nth(1).name()).to.be.equal('Dog');
			expect(col.nth(2).name()).to.be.equal('Bar');
			expect(col.nth(3).name()).to.be.equal('Foo');
			expect(col.nth(4).name()).to.be.equal('Zoo');
		});

		it('sort by multiple fields with default order', function() {
			col.sort(['active', 'age']);
			expect(col.size()).to.be.equal(5);
			expect(col.nth(0).name()).to.be.equal('Bar');
			expect(col.nth(1).name()).to.be.equal('Jar');
			expect(col.nth(2).name()).to.be.equal('Zoo');
			expect(col.nth(3).name()).to.be.equal('Foo');
			expect(col.nth(4).name()).to.be.equal('Dog');
		});

		it('sort by multiple fields with `specified` order', function() {
			col.sort(['active', 'age'], ['desc', 'asc']);
			expect(col.size()).to.be.equal(5);
			expect(col.nth(0).name()).to.be.equal('Zoo');
			expect(col.nth(1).name()).to.be.equal('Foo');
			expect(col.nth(2).name()).to.be.equal('Dog');
			expect(col.nth(3).name()).to.be.equal('Bar');
			expect(col.nth(4).name()).to.be.equal('Jar');
		});

		it('reverse', function() {
			var v0 = col.nth(0).name();
			var v1 = col.nth(1).name();
			var v2 = col.nth(2).name();
			var v3 = col.nth(3).name();
			var v4 = col.nth(4).name();
			col.reverse();
			expect(col.size()).to.be.equal(5);
			expect(col.nth(0).name()).to.be.equal(v4);
			expect(col.nth(1).name()).to.be.equal(v3);
			expect(col.nth(2).name()).to.be.equal(v2);
			expect(col.nth(3).name()).to.be.equal(v1);
			expect(col.nth(4).name()).to.be.equal(v0);
		});

		it('randomize', function() {
			var oldOrder = col.toArray();
			col.randomize();
			var newOrder = col.toArray();
			var countNotEqual = 0;
			for (var i = newOrder.length - 1; i >= 0; i--) {
				if (oldOrder[i].lid() !== newOrder[i].lid()) {
					countNotEqual++;
				}
			}
			expect(col.size()).to.be.equal(5);
			expect(countNotEqual).to.be.above(0);
		});

	});


	describe('#dispose()', function() {
		'use strict';

		it('successful dispose', function() {
			var col = new md.Collection({
				model: Model.User
			});
			var userA = new Model.User({
				name: 'Foo'
			});
			var userB = new Model.User({
				name: 'Bar'
			});
			var userC = new Model.User({
				name: 'Baz'
			});
			var userD = new Model.User({
				name: 'Test'
			});
			col.addAll([userA, userB, userC, userD]);
			col.dispose();
			var keys = _.keys(col);
			for (var i = 0; i < keys.length; i++) {
				expect(col[keys[i]]).to.be.null;
			}
		});

	});

	describe('#stateOf()', function() {
		'use strict';

		var col;

		before(function() {
			col = new md.Collection({
				model: Model.User,
				state: ['stateA', 'stateB']
			});
			var userA = new Model.User({
				id: '123',
				name: 'Foo'
			});
			var userB = new Model.User({
				id: '456',
				name: 'Bar'
			});
			var userC = new Model.User({
				id: '789',
				name: 'Baz'
			});
			var userD = new Model.User({
				id: '109',
				name: 'Test'
			});
			col.addAll([userA, userB, userC, userD]);
		});

		it('successful state', function() {
			expect(col.stateOf('123').stateA()).to.be.undefined;
			col.stateOf('123').stateA('New State');
			expect(col.stateOf('123').stateA()).to.be.equal('New State');
		});

	});

	describe('#hasModel()', function() {
		'use strict';

		it('return correct boolean', function() {
			var colA = new md.Collection({
				model: Model.User
			});
			expect(colA.hasModel()).to.be.true;
			var colB = new md.Collection();
			expect(colB.hasModel()).to.be.false;
		});

	});

	describe('#model()', function() {
		'use strict';

		it('return correct value', function() {
			var colA = new md.Collection({
				model: Model.User
			});
			expect(colA.model()).to.be.equal(Model.User);
			var colB = new md.Collection();
			expect(colB.model()).to.be.undefined;
		});

	});

	describe('#url()', function() {
		'use strict';

		it('returns a string', function() {
			var colA = new md.Collection({
				model: Model.User
			});
			expect(colA.url()).to.be.a('string');
		});

	});

	describe('#fetch()', function() {
		'use strict';

		var _ids = [];
		var _models = {};

		before(function(done) {
			var len = 5;
			var cnt = 0;
			var user;
			var fn = function(model) {
				_ids.push(model.id());
				_models[model.id()] = model;
				cnt++;
				if (cnt >= len)
					done();
			};
			for (var i = len; i > 0; i--) {
				user = new Model.User();
				user.name('CollFetch' + i);
				user.save().then(fn);
			}
		});

		it('success fetch', function(done) {
			var colA = new md.Collection({
				model: Model.User
			});
			colA.fetch([_ids[2], _ids[3]]).then(function() {
				try {
					var moA = colA.models[0];
					expect(moA.id).to.equal(_models[moA.id].id())
					expect(moA.name).to.equal(_models[moA.id].name())
					var moB = colA.models[1];
					expect(moB.id).to.equal(_models[moB.id].id())
					expect(moB.name).to.equal(_models[moB.id].name())
					done();
				} catch (e) {
					done(e);
				}
			}, function(err) {
				done(err);
			});
		});

		it('success fetch using callback', function(done) {
			var colA = new md.Collection({
				model: Model.User
			});
			colA.fetch([_ids[2], _ids[3]], function(err, response, models) {
				if (err) {
					done(err);
					return;
				} else {
					try {
						var moA = colA.models[0];
						expect(moA.id).to.equal(_models[moA.id].id())
						expect(moA.name).to.equal(_models[moA.id].name())
						var moB = colA.models[1];
						expect(moB.id).to.equal(_models[moB.id].id())
						expect(moB.name).to.equal(_models[moB.id].name())
						expect(response.length).to.equal(2);
						expect(response[0].id).to.equal(moA.id);
						expect(response[0].name).to.equal(moA.name);
						expect(response[1].id).to.equal(moB.id);
						expect(response[1].name).to.equal(moB.name);
						done();
					} catch (e) {
						done(e);
					}
				}
			});
		});

		it('clear option', function(done) {
			var colA = new md.Collection({
				model: Model.User
			});
			var userA;
			colA.add(userA = new Model.User({
				name: 'UserA'
			}));
			colA.add(new Model.User({
				name: 'UserB'
			}));

			expect(colA.size()).to.equal(2);

			colA.fetch([_ids[2], _ids[3]], {
				clear: true
			}).then(function() {
				try {
					expect(colA.size()).to.equal(2);
					expect(colA.contains(userA)).to.be.false;
					done();
				} catch (e) {
					done(e);
				}
			}, done);
		});

	});

});