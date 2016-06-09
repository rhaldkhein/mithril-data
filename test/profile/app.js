window.onload = function() {

	// Model
	var Model = window.Model = {};

	Model.User = md.model({
		name: 'User',
		props: ['name', 'profile', 'data']
	});

	Model.Note = md.model({
		name: 'Note',
		props: ['foo', 'bar'],
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

	// console.dir(Model.User);
	// console.dir(Model.Note);

	var Demo = {
		// Controller
		controller: function() {
			var self = this;
			this.collection = Model.User.createCollection();
			this.add = function() {
				console.log('Add');
				self.collection.add(new Model.User({
					name: 'Foo_' + self.collection.size()
				}));
			};
			this.remove = function() {
				console.log('Remove');
				self.collection.remove(self.collection.last());
			};
			// this.add();
		},
		// View
		view: function(ctrl) {
			return m('div', [
				m('button', {
					onclick: ctrl.add
				}, 'Add'),
				m('button', {
					onclick: ctrl.remove
				}, 'Remove'),
				m('div', ctrl.collection.map(function(model, i) {
					return m('ul', [
						m('li', 'Model ' + i),
						m('li', 'name: ' + model.name()),
						m('hr')
					]);
				}))
			]);
		}
	};

	//initialize
	m.mount(document.body, Demo);

};