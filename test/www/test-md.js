// Root before - Run before all tests.
before(function(done) {

	it("create sample schemas for test", function() {
		window.Model.User = md.model({
			name: 'User',
			props: ['name', 'profile', 'age', 'active']
		});

		window.Model.Note = md.model({
			name: 'Note',
			defaults: {
				title: 'Default Title',
				body: 'Default Note Body',
				author: new Model.User({
					name: 'User Default'
				})
			},
			refs: {
				author: 'User'
			}
		});

		expect(window.Model.User).to.exist;
		expect(window.Model.Note).to.exist;

	});

	// Clear all test data in server.
	md.store.get('/clear').then(function() {
		done();
	}, function(err) {
		done(err);
	});

});

describe("md", function() {
	"use strict";

	it("exists", function() {
		expect(md).to.exists;
	});

	it("is an object", function() {
		expect(md).to.be.a("object");
	});

	describe("#version()", function() {
		"use strict";

		it("exists", function() {
			expect(md.version).to.be.a("function");
		});

		it("is a string", function() {
			expect(md.version()).to.be.a("string");
		});

	});

	describe("#noConflict()", function() {
		"use strict";

		it("exists", function() {
			expect(md.noConflict).to.be.a("function");
		});

	});

	describe("#config()", function() {
		"use strict";

		it("exists", function() {
			expect(md.config).to.be.a("function");
		});

	});

	describe("#resetConfig()", function() {
		"use strict";

		after(function() {
			md.resetConfig();
		})

		it("exists", function() {
			expect(md.resetConfig).to.be.a("function");
		});

		it("return back to defaults", function() {
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

	describe("#model()", function() {
		"use strict";

		it("exists", function() {
			expect(md.model).to.exist;
		});

		it("is a function", function() {
			expect(md.model).to.be.a("function");
		});

		it("returns a Model Constructor", function() {
			var User = window.Model.User;
			expect(User.prototype.__proto__).to.equal(md.__TEST__.BaseModel.prototype);
			expect(User).to.be.instanceof(md.__TEST__.ModelConstructor);
		});

		it("throw error on missing name", function() {
			expect(function() {
				var ModelA = md.model({
					props: ['name']
				});
			}).to.throw(Error);
		});

		it("throw error on restricted props", function() {
			expect(function() {
				var ModelB = md.model({
					name: 'ModelB',
					props: ['url'] // `url` is reserved
				});
				var mdl = new ModelB();
			}).to.throw(Error);
		});

		it("correct url", function() {
			var ModelB = md.model({
				name: 'ModelB',
				url: '/modelb'
			});
			var mdl = new ModelB();
			expect(mdl.url()).to.equal('/modelb');
		});

		it("get model constructor from different scope", function() {
			// In scope "A"
			md.model({
				name: 'ModelC'
			});
			// In scope "B"
			var mdl = new(md.model.get('ModelC'));
			expect(mdl).to.be.instanceof(md.__TEST__.BaseModel);
		});

	});

});