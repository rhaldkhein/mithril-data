describe("Model Instance", function() {
	"use strict"

	var User = window.Model.User
	var user = new User()

	it("is instance of `BaseModel`", function() {
		expect(user).to.be.instanceof(md.__TEST__.BaseModel)
	})

	it("prop defaults to `undefined`", function() {
		expect(user.profile()).to.be.undefined
	});

	it("prop sets `null`", function() {
		user.name(null)
		expect(user.name()).to.be.null
	})

	it("prop sets `undefined`", function() {
		user.name(undefined)
		expect(user.name()).to.be.undefined
	})

	it("prop set and read the correct value", function() {
		user.name("test")
		expect(user.name()).to.equal("test")
	})

	it("have all properties that was set in `props` with values of type function", function() {
		var props = User.modelOptions.props
		for (var i = 0; i < props.length; i++) {
			expect(user).to.have.property(props[i]).and.to.be.a("function")
		}
	})

})

describe("Model.<properties>", function() {
	"use strict"

	var User = window.Model.User
	var user = new User()

	it("`__cid` exist with value type of string", function() {
		expect(user).to.have.property("__cid").and.to.be.a("string")
	})

	it("`__collections` exist with value type of array of Collections", function() {
		expect(user).to.have.property("__collections").and.to.be.a("array")
		expect(user.__collections[0]).to.be.instanceof(md.Collection)
	})

	it("`__options` exist with value type of object", function() {
		expect(user).to.have.property("__options").and.to.be.a("object")
	})

	it("`__json` exist - *** the object representation of the model ***", function() {
		expect(user).to.have.property("__json").and.to.be.a("object")
	})

	it("`__json` has `__model` property with value referencing to its model instance", function() {
		expect(user.__json.__model).to.be.equal(user)
	})


	it("`__json` have all model properties (props)", function() {
		var props = User.modelOptions.props
		for (var i = 0; i < props.length; i++) {
			expect(user.__json).to.have.property(props[i])
		}
	})

	it("`__json` properties are equal to its model properties", function() {
		var props = User.modelOptions.props
		user.profile(false)
		for (var i = 0; i < props.length; i++) {
			expect(user[props[i]]()).to.equal(user.__json[props[i]])
		}
	})

	it("`__json` will update on change of prop", function() {
		user.name('New Value')
		expect(user.__json.name).to.equal('New Value')
	})

	it("`__json` will update by `set()` or `setAll()`", function() {
		user.set('name', 'foo')
		expect(user.__json.name).to.equal('foo')
		user.set({
			name: 'bar',
			profile: 'baz'
		})
		expect(user.__json.name).to.equal('bar')
		expect(user.__json.profile).to.equal('baz')
	})

});

describe("Model.cid()", function() {
	"use strict"

	var user = new window.Model.User()

	it("returns a string with value of its `__cid`", function() {
		expect(user.cid()).to.be.a('string').and.equal(user.__cid)
	})

})

describe("Model.url()", function() {
	"use strict"

	var user = new window.Model.User();

	it("returns a string", function() {
		expect(user.cid()).to.be.a('string')
	})

})

describe("Model.attachCollection()", function() {
	"use strict"

	var user = new window.Model.User()

	it("successfully add to collection", function() {
		var collection = new md.Collection()
		var size = collection.size()
		user.attachCollection(collection)
		expect(collection.size()).to.be.equal(size + 1)
		expect(collection.models).to.contain(user.getJson())
		expect(user.__collections).to.contain(collection)
	})

})