
describe("md", function() {
	"use strict"

	it("exists", function() {
		expect(md).to.exists
	})

	it("is an object", function() {
		expect(md).to.be.a("object")
	})

})

describe("md.version()", function() {
	"use strict"

	it("exists", function() {
		expect(md.version).to.be.a("function")
	})

	it("is a string", function() {
		expect(md.version()).to.be.a("string")
	})

})

describe("md.noConflict()", function() {
	"use strict"

	it("exists", function() {
		expect(md.noConflict).to.be.a("function")
	})

})

describe("md.config()", function() {
	"use strict"

	it("exists", function() {
		expect(md.config).to.be.a("function")
	})

})