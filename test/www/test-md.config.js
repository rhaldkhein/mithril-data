describe('md.config()', function() {
	'use strict';

	afterEach(function() {
		md.resetConfig();
	});

	describe('baseUrl', function() {
		'use strict';

		it('for model', function() {
			md.config({
				baseUrl: '/base'
			});
			var user = new Model.User();
			expect(user.url()).to.equal('/base/user');
		});

		it('for model with custom url', function() {
			md.config({
				baseUrl: '/base'
			});
			var ModelConfigBaseUrlA = md.model({
				name: 'ModelConfigBaseUrlA',
				url: '/modelurl'
			});
			var mdl = new ModelConfigBaseUrlA();
			expect(mdl.url()).to.equal('/base/modelurl');
		});

		it('for collection without model', function() {
			md.config({
				baseUrl: '/base'
			});
			var colA = new md.Collection();
			expect(colA.url()).to.equal('/base');
		});

		it('for collection without model but with custom url', function() {
			md.config({
				baseUrl: '/base'
			});
			var colA = new md.Collection({
				url: '/collectionurl'
			});
			expect(colA.url()).to.equal('/base/collectionurl');
		});

		it('for collection with model', function() {
			md.config({
				baseUrl: '/base'
			});
			var colB = new md.Collection({
				model: Model.User
			});
			expect(colB.url()).to.equal('/base/user');
		});

		it('for collection with custom url', function() {
			md.config({
				baseUrl: '/base'
			});
			var colC = new md.Collection({
				model: Model.User,
				url: '/collectionurl'
			});
			expect(colC.url()).to.equal('/base/collectionurl');
		});


		it('for collection with model that is with custom url', function() {
			md.config({
				baseUrl: '/base'
			});
			var ModelConfigBaseUrlB = md.model({
				name: 'ModelConfigBaseUrlB',
				url: '/modelurl'
			});
			var colD = new md.Collection({
				model: ModelConfigBaseUrlB
			});
			expect(colD.url()).to.equal('/base/modelurl');
		});

	});

	describe('keyId', function() {
		'use strict';

		it('exist in model and is a function', function() {
			md.config({
				keyId: 'customKey'
			});
			var ModelCustomKeyIdA = md.model({
				name: 'ModelCustomKeyIdA',
				props: ['name']
			});
			var mdl = new ModelCustomKeyIdA();
			expect(mdl.customKey).to.be.a('function');
		});

		it('set and get correct value through method `id()`', function() {
			md.config({
				keyId: 'customKey'
			});
			var ModelCustomKeyIdB = md.model({
				name: 'ModelCustomKeyIdB',
				props: ['name']
			});
			var mdl = new ModelCustomKeyIdB();
			mdl.id('test123');
			expect(mdl.id()).to.equal('test123');
			expect(mdl.__json.customKey).to.equal('test123');
			expect(mdl.__json.id).to.not.exist;
		});

	});

	describe('constructorMethods', function() {
		'use strict';

		it('exist in model and is a function', function() {
			md.config({
				constructorMethods: {
					customConsMethod: function() {
						expect(this).to.be.a('function');
					}
				}
			});
			var ConsCustomMethodsA = md.model({
				name: 'ConsCustomMethodsA'
			});
			var ConsCustomMethodsB = md.model({
				name: 'ConsCustomMethodsA'
			});
			expect(ConsCustomMethodsA.customConsMethod).to.be.a('function');
			ConsCustomMethodsA.customConsMethod();
			expect(ConsCustomMethodsB.customConsMethod).to.be.a('function');
			ConsCustomMethodsB.customConsMethod();
		});

	});

	describe('modelMethods', function() {
		'use strict';

		it('exist in model and is a function', function() {
			md.config({
				modelMethods: {
					customModelMethod: function() {
						expect(this).to.be.instanceof(md.__TEST__.BaseModel);
					}
				}
			});
			var ModelCustomMethodsA = md.model({
				name: 'ModelCustomMethodsA'
			});
			var ModelCustomMethodsB = md.model({
				name: 'ModelCustomMethodsB'
			});
			var mdlA = new ModelCustomMethodsA();
			expect(mdlA.customModelMethod).to.be.a('function');
			mdlA.customModelMethod();
			var mdlB = new ModelCustomMethodsA();
			expect(mdlB.customModelMethod).to.be.a('function');
			mdlB.customModelMethod();
		});

	});

	describe('collectionMethods', function() {
		'use strict';

		it('exist in model and is a function', function() {
			md.config({
				collectionMethods: {
					customColMethod: function() {
						expect(this).to.be.instanceof(md.Collection);
					}
				}
			});
			var ColA = new md.Collection();
			var ColB = new md.Collection();
			expect(ColA.customColMethod).to.be.a('function');
			ColA.customColMethod();
			expect(ColB.customColMethod).to.be.a('function');
			ColB.customColMethod();
		});

	});

	describe('modelBindMethods', function() {
		'use strict';

		it('direct own property', function() {
			md.config({
				modelBindMethods: ['save', 'destroy']
			});
			var ModelBindMethodsA = md.model({
				name: 'ModelBindMethodsA'
			});
			var mdl = new ModelBindMethodsA();
			expect(mdl.hasOwnProperty('save')).to.be.true;
			expect(mdl.hasOwnProperty('destroy')).to.be.true;
		});

	});

	describe('collectionBindMethods', function() {
		'use strict';

		it('direct own property', function() {
			md.config({
				collectionBindMethods: ['fetch']
			});
			var col = new md.Collection();
			expect(col.hasOwnProperty('fetch')).to.be.true;
		});

	});

	describe('storeConfigOptions', function() {
		'use strict';

		it('added to md config', function() {
			var fn = function() {};
			md.config({
				storeConfigOptions: fn
			});
			expect(md.__TEST__.config.storeConfigOptions).to.equal(fn);
		});

		it('called with correct arguments', function(done) {
			var fn = function(options) {
				expect(options.method).to.equal('GET');
				expect(options.url).to.equal('/exist');
				done();
			};
			md.config({
				storeConfigOptions: fn
			});
			md.store.request('/exist');
		});

	});

	describe('storeConfigXHR', function() {
		'use strict';

		it('added to md config', function() {
			var fn = function() {};
			md.config({
				storeConfigXHR: fn
			});
			expect(md.__TEST__.config.storeConfigXHR).to.equal(fn);
		});

	});

	describe('storeExtract', function() {
		'use strict';
		// This test case suite will create error
		// storeExtract must be configured before everthing else
		it('added to md config', function() {
			var fn = function() {};
			md.config({
				storeExtract: fn
			});
			expect(md.__TEST__.config.storeExtract).to.equal(fn);
		});

	});

	describe('store', function() {
		'use strict';

		it('added to md config', function() {
			var fn = function() {};
			md.config({
				store: fn
			});
			expect(md.__TEST__.config.store).to.equal(fn);
		});

		it('called with correct arguments', function(done) {
			var fn = function(data) {
				expect(data.method).to.equal('GET');
				expect(data.url).to.equal('/exist');
				expect(data.data).to.exist;
				done();
			};
			md.config({
				store: fn
			});
			md.store.request('/exist');
		});

	});

	describe('stream', function() {
		'use strict';

		it('added to config', function() {
			var fn = function() {};
			md.config({
				stream: fn
			});
			expect(md.__TEST__.config.stream).to.equal(fn);
		});

		it('added to md', function() {
			var fn = function() {};
			md.config({
				stream: fn
			});
			expect(md.stream).to.equal(fn);
		});

	});

});