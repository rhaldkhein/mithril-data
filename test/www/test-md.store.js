describe('md.store', function() {
	'use strict';

	describe('#request()', function() {
		'use strict';

		it('exist and is a function', function() {
			expect(md.store.request).to.be.a('function');
		});

		it('returns a promise', function() {
			var req = md.store.request('/exist');
			expect(req).to.be.instanceof(Promise);
			expect(req.then).to.be.a('function');
			expect(req.catch).to.be.a('function');
		});

		it('reject on http error', function() {
			expect(md.store.request('/notexist')).to.be.rejected;
		});

		it('resolve on http success', function() {
			var req = md.store.request('/exist'); 
			expect(req).to.be.fulfilled;
			expect(req).to.be.become('ok');
		});

	});

	describe('#get(), #post(), #put(), #destroy()', function() {
		'use strict';

		it('exist and is a function', function() {
			expect(md.store.get).to.be.a('function');
			expect(md.store.post).to.be.a('function');
			expect(md.store.put).to.be.a('function');
			expect(md.store.destroy).to.be.a('function');
		});

	});

});