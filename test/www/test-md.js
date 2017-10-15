// Root before - Run before all tests.
before(function(done) {

	it('create sample schemas for test', function(done) {

		window.Model.User = md.model({
			name: 'User',
			props: ['name', 'profile', 'age', 'active'],
			statics: {
				hello: function() {
					return 'Hello World';
				}
			}
		});

		window.Model.Folder = md.model({
			name: 'Folder',
			props: ['name', 'size'],
			defaults: {
				name: 'Untitled Folder'
			}
		});

		window.Model.Note = md.model({
			name: 'Note',
			defaults: {
				title: 'Default Title',
				body: 'Default Note Body',
				author: new Model.User({
					name: 'User Default'
				}),
				folder: new Model.Folder({
					name: 'Folder Default'
				})
			},
			refs: {
				author: 'User',
				folder: 'Folder'
			},
			parser: function(data) {
				if (data && data.wrap) {
					return {
						title: data.wrap.title,
						body: data.wrap.inner.body,
						author: data.wrap.inner.author
					};
				}
				return data;
			}
		});

		// This model simulate undefined result
		window.Model.Alarm = md.model({
			name: 'Alarm',
			url: '/undefined',
			props: ['title', 'time'],
			defaults: {
				title: 'Default Alarm Title',
				time: '8:00 AM'
			}
		});

		expect(window.Model.User).to.exist;
		expect(window.Model.Folder).to.exist;
		expect(window.Model.Note).to.exist;

		Promise.all([
			(new Model.Folder({
				id: 'fold001',
				name: 'System'
			})).save(),
			(new Model.Folder({
				id: 'fold002',
				name: 'Admin'
			})).save(),
			(new Model.User({
				id: 'user001',
				name: 'UserFoo',
				age: 1
			})).save(),
			(new Model.User({
				id: 'user002',
				name: 'UserBar',
				age: 2
			})).save(),
		]).then(function() {
			done();
		});

	});

	// Clear all test data in server.
	md.store.get('/clear').then(function() {
		done();
	}, function(err) {
		done(err);
	});

});

describe('md', function() {
	'use strict';

	it('exists', function() {
		expect(md).to.exists;
	});

	it('is an object', function() {
		expect(md).to.be.a('object');
	});

	describe('#version()', function() {
		'use strict';

		it('exists', function() {
			expect(md.version).to.be.a('function');
		});

		it('is a string', function() {
			expect(md.version()).to.be.a('string');
		});

	});

	describe('#stream()', function() {
		'use strict';

		it('exists', function() {
			expect(md.stream).to.be.a('function');
		});

		it('real stream', function() {
			var sInt = md.stream(123);
			expect(sInt.constructor).to.be.equal(md.stream);
			expect(sInt.name).to.be.equal('stream');
		});

	});

	describe('#toStream()', function() {
		'use strict';

		it('exists', function() {
			expect(md.toStream).to.be.a('function');
		});

		it('any value', function() {
			var sInt = md.toStream(123);
			var sString = md.toStream('Foo');
			var sUndefined = md.toStream();
			expect(sInt()).to.be.a('number');
			expect(sInt()).to.be.equal(123);
			expect(sString()).to.be.a('string');
			expect(sString()).to.be.equal('Foo');
			expect(sUndefined()).to.be.undefined;
		});

		it('stream value', function() {
			var sInt = md.toStream(123);
			var newStream = md.toStream(sInt);
			expect(newStream()).to.be.a('number');
			expect(newStream()).to.be.equal(123);
		});

		it('real stream', function() {
			var sInt = md.toStream(123);
			expect(sInt.constructor).to.be.equal(md.stream);
			expect(sInt.name).to.be.equal('stream');
		});

	});

	describe('#noConflict()', function() {
		'use strict';

		it('exists', function() {
			expect(md.noConflict).to.be.a('function');
		});

	});

	describe('#config()', function() {
		'use strict';

		it('exists', function() {
			expect(md.config).to.be.a('function');
		});

	});

	describe('#resetConfig()', function() {
		'use strict';

		after(function() {
			md.resetConfig();
		})

		it('exists', function() {
			expect(md.resetConfig).to.be.a('function');
		});

		it('return back to defaults', function() {
			var fn = function() {};
			md.config({
				keyId: 'customId',
				storeExtract: fn
			});
			expect(md.__TEST__.config.storeExtract).to.equal(fn);
			expect(md.__TEST__.config.keyId).to.equal('customId');
			md.resetConfig();
			expect(md.__TEST__.config.storeExtract).to.be.undefined;
			expect(md.__TEST__.config.keyId).to.equal('id');
		});

	});

	describe('#model()', function() {
		'use strict';

		it('exists', function() {
			expect(md.model).to.exist;
		});

		it('is a function', function() {
			expect(md.model).to.be.a('function');
		});

		it('returns a Model Constructor', function() {
			var User = window.Model.User;
			expect(User.prototype.__proto__).to.equal(md.__TEST__.BaseModel.prototype);
			expect(User).to.be.instanceof(md.__TEST__.ModelConstructor);
		});

		it('throw error on missing name', function() {
			expect(function() {
				var ModelA = md.model({
					props: ['name']
				});
			}).to.throw(Error);
		});

		it('throw error on restricted props', function() {
			expect(function() {
				var ModelB = md.model({
					name: 'ModelB',
					props: ['url'] // `url` is reserved
				});
				var mdl = new ModelB();
			}).to.throw(Error);
		});

		it('correct url', function() {
			var ModelB = md.model({
				name: 'ModelB',
				url: '/modelb'
			});
			var mdl = new ModelB();
			expect(mdl.url()).to.equal('/modelb');
		});

		it('get model constructor from different scope', function() {
			// In scope 'A'
			md.model({
				name: 'ModelC'
			});
			// In scope 'B'
			var mdl = new(md.model.get('ModelC'));
			expect(mdl).to.be.instanceof(md.__TEST__.BaseModel);
		});

	});

});