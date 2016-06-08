describe("md.store", function() {
	"use strict";

	describe("#request()", function() {
		"use strict";

		it("exist and is a function", function() {
			expect(md.store.request).to.be.a('function');
		});

		it("returns a promise", function() {
			var req = md.store.request('/notexist');
			expect(req).to.be.a('function');
			expect(req.then).to.be.a('function');
			expect(req.catch).to.be.a('function');
		});

		it("reject on http error", function(done) {
			md.store.request('/notexist').then(function() {
				done('Should not resolve');
			}, function(err) {
				if(!err){
					done('Expect `err` to exist');
					return;
				}
				done();
			});
		});

		it("resolve on http success", function(done) {
			md.store.request('/exist').then(function(data) {
				if (!data.length) {
					done('Expect `data` to not empty');
					return;
				}
				done();
			}, function(err) {
				done('Should not reject');
			});
		});

	});

	describe("#get(), #post(), #put(), #destroy()", function() {
		"use strict";

		it("exist and is a function", function() {
			expect(md.store.get).to.be.a('function');
			expect(md.store.post).to.be.a('function');
			expect(md.store.put).to.be.a('function');
			expect(md.store.destroy).to.be.a('function');
		});

	});

});