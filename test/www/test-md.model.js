window.Model.User = md.model({
	name: 'User',
	props: ['name', 'profile']
})

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

console.dir(window.Model.User)
console.dir(window.Model.Note)

describe("md.model()", function() {
	"use strict"

	it("exists", function() {
		expect(md.model).to.exist
	})

	it("is a function", function() {
		expect(md.model).to.be.a("function")
	})

	it("create sample model constructors (`User` and `Note`)", function() {
		expect(window.Model.User).to.exist
		expect(window.Model.Note).to.exist
	})

	it("returns a Model Constructor", function() {
		var User = window.Model.User;
		expect(User.name).to.equal("Model")
		expect(User.prototype.__proto__).to.equal(md.__TEST__.BaseModel.prototype)
		expect(User).to.be.instanceof(md.__TEST__.ModelConstructor)
	})

})