describe("Model Constructor", function() {
	"use strict";

	it("is a constructor function", function() {
		var User = Model.User;
		expect(User).to.be.a("function");
	});

	it("has `modelOptions` property", function() {
		var User = Model.User;
		expect(User).to.have.property('modelOptions');
	});

	it("`modelOptions` has `name` property with type of string", function() {
		var User = Model.User;
		expect(User.modelOptions).to.have.property('name');
		expect(User.modelOptions.name).to.be.a('string');
	});

	it("`modelOptions` has `props` property with type of array of strings", function() {
		var User = Model.User;
		expect(User.modelOptions).to.have.property('props');
		expect(User.modelOptions.props).to.be.a('array');
		expect(User.modelOptions.props[0]).to.be.a('string');
	});

	describe("#createCollection()", function() {
		"use strict";

		it("exist", function() {
			var User = Model.User;
			expect(User).to.have.property('createCollection');
		});

		it("returns new instance of `md.Collection`", function() {
			var User = Model.User;
			var userCollection = User.createCollection();
			expect(userCollection).to.be.an.instanceof(md.Collection);
			expect(userCollection.__options.model).to.exist;
			expect(userCollection.__options.model).to.equal(User);
		});

	});

	describe("#createModels()", function() {
		"use strict";

		it("exist", function() {
			expect(Model.User.createModels).to.be.a.function;
		});

		it("convert array of object-data to array of models", function() {
			var models = Model.User.createModels([{
				name: 'Foo'
			}, {
				name: 'Bar'
			}]);
			expect(models[0].name()).to.equal("Foo");
			expect(models[1].name()).to.equal("Bar");
		});

	});

	describe("#pull()", function() {
		"use strict";

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
				if (cnt >= len) {
					done();
					return;
				}
			};
			for (var i = len; i > 0; i--) {
				user = new Model.User();
				user.name('Foo' + i);
				user.age(111);
				user.save().then(fn);
			}
		});

		it("exist", function() {
			expect(Model.User.pull).to.exist.and.be.a.function;
		});

		it("should pull (1) - pull by array (of ids)", function(done) {
			// url: /user?0=idabc&1=idxyz
			// if you prefer /user/idabc/idxyz
			// url is parsable through md.config { storeConfigOptions }
			Model.User.pull('/user', [_ids[1], _ids[2]]).then(function(models) {
				try {
					expect(models.length).to.equal(2);
					var m0 = models[0];
					expect(m0.name()).to.equal(_models[m0.id()].name());
					var m1 = models[1];
					expect(m1.name()).to.equal(_models[m1.id()].name());
					done();
				} catch (e) {
					done(e);
				}
			}, function(err) {
				done(err);
			})
		});

		it("should pull (2) - pull by object (query)", function(done) {
			// url: /user?name=Test&age=111
			// if you prefere /user/Test/111
			// url is parsable through md.config { storeConfigOptions }
			Model.User.pull('/user', {
				name: 'Test',
				age: 111
			}).then(function(models) {
				try {
					done();
				} catch (e) {
					done(e);
				}
			}, function(err) {
				done(err);
			})
		});

		it("should pull (3) - pull without data", function(done) {
			Model.User.pull('/user').then(function(models) {
				try {
					expect(models.length).to.equal(5);
					done();
				} catch (e) {
					done(e);
				}
			}, function(err) {
				done(err);
			})
		});

		it("pull using callback function", function(done) {
			Model.User.pull('/user', function(err, response, models) {
				if (err) {
					done(err);
					return;
				}
				try {
					expect(response).to.exist;
					expect(models).to.exist;
					done();
				} catch (e) {
					done(e);
				}
			});
		});

	});

});