describe("Model Instance", function() {
	"use strict";

	it("is instance of `BaseModel`", function() {
		var user = new Model.User();
		expect(user).to.be.instanceof(md.__TEST__.BaseModel);
	});

	it("create instance with DEFAULT prop values", function() {
		var note = new Model.Note({
			title: 'Foo'
		});
		expect(note.title()).to.be.equal('Foo');
		expect(note.body()).to.be.equal(Model.Note.modelOptions.defaults.body);
		expect(note.author()).to.be.equal(Model.Note.modelOptions.defaults.author);
	});

	it("create instance with defined prop values", function() {
		var user = new Model.User({
			name: 'Foo',
		});
		expect(user.name()).to.be.equal('Foo');
		expect(user.profile()).to.be.undefined;
	});

	it("create instance with defined prop values and reference model", function() {
		var noteA = new Model.Note({
			title: 'Foo',
			author: {
				name: 'Bar'
			}
		});
		expect(noteA.title()).to.be.equal('Foo');
		expect(noteA.author()).to.be.instanceof(md.__TEST__.BaseModel);
		expect(noteA.author().name()).to.be.equal('Bar');

		var userB = new Model.User({
			name: 'TestUser'
		});
		var noteB = new Model.Note({
			title: 'TestNote',
			author: userB
		});
		expect(noteB.title()).to.be.equal('TestNote');
		expect(noteB.author()).to.be.instanceof(md.__TEST__.BaseModel);
		expect(noteB.author().name()).to.be.equal('TestUser');
	});

	it("prop defaults to `undefined`", function() {
		var user = new Model.User();
		expect(user.profile()).to.be.undefined;
	});

	it("prop sets `null`", function() {
		var user = new Model.User();
		user.name(null);
		expect(user.name()).to.be.null;
	});

	it("prop sets `undefined`", function() {
		var user = new Model.User();
		user.name(undefined);
		expect(user.name()).to.be.undefined;
	});

	it("prop set and read the correct value", function() {
		var user = new Model.User();
		user.name("test");
		expect(user.name()).to.equal("test");
	});

	it("have all properties that was set in `props` with values of type function", function() {
		var props = Model.User.modelOptions.props;
		var user = new Model.User();
		for (var i = 0; i < props.length; i++) {
			expect(user).to.have.property(props[i]).and.to.be.a("function");
		}
	});

});

describe("Model.<properties>", function() {
	"use strict";

	it("`__cid` exist with value type of string", function() {
		var user = new Model.User();
		expect(user).to.have.property("__cid").and.to.be.a("string");
	});

	it("`__collections` exist with value type of array", function() {
		var user = new Model.User();
		expect(user).to.have.property("__collections").and.to.be.a("array");
	});

	it("`__options` exist with value type of object", function() {
		var user = new Model.User();
		expect(user).to.have.property("__options").and.to.be.a("object");
	});

	it("`__json` exist - *** the object representation of the model ***", function() {
		var user = new Model.User();
		expect(user).to.have.property("__json").and.to.be.a("object");
	});

	it("`__json` has `__model` property with value referencing to its model instance", function() {
		var user = new Model.User();
		expect(user.__json.__model).to.be.equal(user);
	});


	it("`__json` have all model properties (props)", function() {
		var props = Model.User.modelOptions.props;
		var user = new Model.User();
		for (var i = 0; i < props.length; i++) {
			expect(user.__json).to.have.property(props[i]);
		}
	});

	it("`__json` properties are equal to its model properties", function() {
		var props = Model.User.modelOptions.props;
		var user = new Model.User();
		user.profile(false);
		for (var i = 0; i < props.length; i++) {
			expect(user[props[i]]()).to.equal(user.__json[props[i]]);
		}
	});

	it("`__json` will update on change of prop", function() {
		var user = new Model.User();
		user.name('New Value');
		expect(user.__json.name).to.equal('New Value');
	});

	it("`__json` will update through `set()` or `setAll()`", function() {
		var user = new Model.User();
		user.set('name', 'foo');
		expect(user.__json.name).to.equal('foo');
		user.set({
			name: 'bar',
			profile: 'baz'
		});
		expect(user.__json.name).to.equal('bar');
		expect(user.__json.profile).to.equal('baz');
	});

});

describe("Model.opt()", function() {
	"use strict";

	it("set options by plain object", function() {
		var user = new Model.User();
		user.opt({
			test: 'test'
		});
		expect(user.__options.test).to.be.equal('test');
	});

	it("set options by key/value`", function() {
		var user = new Model.User();
		user.opt('key', 'value');
		expect(user.__options.key).to.be.equal('value');
	});

	it("defaults to boolean true", function() {
		var user = new Model.User();
		user.opt('key');
		expect(user.__options.key).to.be.equal(true);
	});

});

describe("Model.cid()", function() {
	"use strict";

	it("returns a string with value of its `__cid`", function() {
		var user = new Model.User();
		expect(user.cid()).to.be.a('string').and.equal(user.__cid);
	});

});

describe("Model.url()", function() {
	"use strict";

	it("returns a string", function() {
		var user = new Model.User();
		expect(user.cid()).to.be.a('string');
	});

});

describe("Model.attachCollection()", function() {
	"use strict";

	it("property `__collections` contains the collection", function() {
		var collection = new md.Collection();
		var user = new Model.User();

		user.attachCollection(collection);
		expect(user.__collections).to.contain(collection);
	});

	it("property `__collections` has correct size", function() {
		var collection = new md.Collection();
		var user = new Model.User();
		var size = user.__collections.length;

		user.attachCollection(collection);
		expect(user.__collections.length).to.be.equal(++size);

		user.attachCollection(collection);
		expect(user.__collections.length).to.be.equal(size);
	});

});

describe("Model.detachCollection()", function() {
	"use strict";

	it("property `__collections` does NOT contain the collection", function() {
		var collection = new md.Collection();
		var user = new Model.User();

		user.attachCollection(collection);
		expect(user.__collections).to.contain(collection);

		user.detachCollection(collection);
		expect(user.__collections).to.not.contain(collection);

	});

	it("property `__collections` has correct size", function() {
		var collection = new md.Collection();
		var user = new Model.User();

		user.attachCollection(collection);
		expect(user.__collections.length).to.be.equal(1);

		user.attachCollection(collection);
		expect(user.__collections.length).to.be.equal(1);

		user.detachCollection(collection);
		expect(user.__collections.length).to.be.equal(0);
	});

});

describe("Model.set()", function() {
	"use strict";

	it("set by object", function() {
		var note = new Model.Note();
		var user = new Model.User();
		note.set({
			title: 'Foo',
			body: 'Bar',
			author: user
		});
		expect(note.title()).to.equal('Foo');
		expect(note.body()).to.equal('Bar');
		expect(note.author()).to.equal(user);
	});

	it("set by object with child object (reference model)", function() {
		var note = new Model.Note();
		note.set({
			title: 'Foo',
			body: 'Bar',
			author: {
				name: 'Test'
			}
		});
		expect(note.title()).to.equal('Foo');
		expect(note.body()).to.equal('Bar');
		expect(note.author()).to.instanceof(md.__TEST__.BaseModel);
		expect(note.author().name()).to.equal('Test');
	});

	it("set by key & value", function() {
		var note = new Model.Note();
		var user = new Model.User();
		note.set('title', 'Foo');
		note.set('body', 'Bar');
		note.set('author', user);
		expect(note.title()).to.equal('Foo');
		expect(note.body()).to.equal('Bar');
		expect(note.author()).to.equal(user);
	});

	it("default to undefined", function() {
		var user = new Model.User();
		user.set({
			name: 'Foo',
		});
		user.set('profile');
		expect(user.name()).to.equal('Foo');
		expect(user.profile()).to.be.undefined;
	});

});

describe("Model.get()", function() {
	"use strict";

	it("return correct value", function() {
		var note = new Model.Note();
		var user = new Model.User();
		note.set({
			title: 'Foo',
			body: 'Bar',
			author: user
		});
		expect(note.get('title')).to.equal('Foo');
		expect(note.get('body')).to.equal('Bar');
		expect(note.get('author')).to.equal(user);
	});

	it("return a copy if NO key is specified (alias of .getCopy())", function() {
		var note = new Model.Note();
		var user = new Model.User();
		note.set({
			title: 'Foo',
			body: 'Bar',
			author: user
		});
		var copy = note.get();
		expect(copy).to.not.equal(note.getJson());
		expect(copy.title).to.equal('Foo');
		expect(copy.body).to.equal('Bar');
		expect(copy.author).to.eql(user.get());
	});

});

describe("Model.getJson()", function() {
	"use strict";

	it("return correct value", function() {
		var user = new Model.User();
		user.set({
			name: 'Foo',
			profile: 'Bar'
		});
		expect(user.getJson()).to.equal(user.__json);
		expect(user.getJson().name).to.equal('Foo');
		expect(user.getJson().profile).to.equal('Bar');
	});

});

describe("Model.getCopy()", function() {
	"use strict";

	it("really return a copy", function() {
		var user = new Model.User();
		user.set({
			name: 'Foo',
			profile: 'Bar'
		});
		var copy = user.getCopy();
		expect(copy).to.not.equal(user.getJson());
	});

	it("values are equal to the original", function() {
		var note = new Model.Note();
		var user = new Model.User();
		note.set({
			title: 'Foo',
			body: 'Bar',
			author: user
		});
		var copy = note.getCopy();
		expect(copy.title).to.equal(note.title());
		expect(copy.body).to.equal(note.body());
		expect(copy.author).to.eql(note.author().getCopy());
	});

	it("copy should not set the original or vice versa", function() {
		var note = new Model.Note();
		var user = new Model.User();
		note.set({
			title: 'Foo',
			body: 'Bar',
			author: user
		});
		var copy = note.getCopy();
		copy.title = 'Baz';
		expect(copy.title).to.not.equal(note.title());
		note.title('Test');
		expect(note.title()).to.not.equal(copy.title);
	});

});


describe("Model.detach()", function() {
	"use strict";

	it("detached from all collections", function() {
		var user = new Model.User();
		var collA = new md.Collection();
		var collB = new md.Collection();
		collA.add(user);
		user.attachCollection(collB);
		expect(user.__collections).to.contain(collA);
		expect(user.__collections).to.contain(collB);
		var arr = user.__collections;
		user.detach();
		expect(arr.length).to.be.equal(0);
	});

});

describe("Model.dispose()", function() {
	"use strict";

	it("disposed", function() {
		var user = new Model.User();
		var keys = _.keys(user);
		user.dispose();
		for (var i = 0; i < keys.length; i++) {
			expect(user[keys[i]]).to.be.null;
		}
	});

});

describe("Model.remove()", function() {
	"use strict";

	it("detached from all collections", function() {
		var user = new Model.User();
		var collA = new md.Collection();
		var collB = new md.Collection();
		collA.add(user);
		user.attachCollection(collB);
		expect(user.__collections).to.contain(collA);
		expect(user.__collections).to.contain(collB);
		var arr = user.__collections;
		user.remove();
		expect(arr.length).to.be.equal(0);
	});

	it("disposed", function() {
		var user = new Model.User();
		var keys = _.keys(user);
		user.remove();
		for (var i = 0; i < keys.length; i++) {
			expect(user[keys[i]]).to.be.null;
		}
	});

});
