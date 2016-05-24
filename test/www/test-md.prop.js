describe("md.prop()", function() {
	"use strict"

	it("exists", function() {
		expect(md.prop).to.be.a("function")
	})

	it("reads correct value", function() {
		var prop = md.prop("test")
		expect(prop()).to.equal("test")
	});

	it("defaults to `undefined`", function() {
		var prop = md.prop()
		expect(prop()).to.be.undefined
	});

	it("sets the correct value", function() {
		var prop = md.prop("test")
		prop("foo")
		expect(prop()).to.equal("foo")
	})

	it("sets `null`", function() {
		var prop = md.prop(null)
		expect(prop()).to.be.null
	})

	it("sets `undefined`", function() {
		var prop = md.prop(undefined)
		expect(prop()).to.be.undefined
	})

	it("returns the new value when set", function() {
		var prop = md.prop()
		expect(prop("foo")).to.equal("foo")
	})

	it("correctly stringifies to the correct value", function() {
		var prop = md.prop("test")
		expect(JSON.stringify(prop)).to.equal('"test"')
	})

	it("correctly stringifies to the correct value as a child", function() {
		var obj = {
			prop: md.prop("test")
		}
		expect(JSON.stringify(obj)).to.equal('{"prop":"test"}')
	})

	it("correctly wraps Mithril promises", function() {
		var defer = m.deferred()
		var prop = md.prop(defer.promise)
		defer.resolve("test")

		expect(prop()).to.equal("test")
	})

	it("returns a thenable when wrapping a Mithril promise", function() {
		var defer = m.deferred()

		var prop = md.prop(defer.promise).then(function() {
			return "test2"
		})

		defer.resolve("test")

		expect(prop()).to.equal("test2")
	})

	it("execute callback when set", function() {
		var prop = md.prop(function(value) {
			expect(value).to.equal("test")
		});
		prop("test");
	})

	it("execute callback when set with context and key", function() {
		var context = {
			foo: "bar"
		}
		var prop = md.prop("initial", context, "key", function(value, key) {
			expect(value).to.equal("test")
			expect(key).to.equal("key")
			expect(this).to.equal(context)
		});
		prop("test")
	})

})