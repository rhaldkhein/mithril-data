(function() {

	// md.config()

	// Model
	var Model = {};

	Model.User = md.model({
		name: 'User',
		props: ['name', 'profile']
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

	console.dir(Model.User);
	console.dir(Model.Note);

	window.Model = Model;

	var Demo = {

		// Controller
		controller: function() {

			// var notes = Model.Note.Collection();
			// notes.fetch({title: 'Hello'});

			// Model.Note.fetch({title: 'Hello'});

			// Create notes collection. This collection can't fetch.
			// var notes = new md.Collection({
			// 	model: Model.Note
			// });

			var notes = Model.Note.createCollection();

			// Create user for notes
			var user = new Model.User();
			user.name('User Foo');

			// Create first note
			var noteA = new Model.Note();
			noteA.id('Bkn6fspG');
			noteA.title('First Note');
			noteA.body('My first note.');
			noteA.author(user);

			// Create second note
			var noteB = new Model.Note({
				title: 'Second Note',
				body: 'My second note.',
				author: user
			});

			// Create second note
			var noteC = new Model.Note({
				title: 'Third Note',
				body: 'My third note.',
				author: user
			});

			// Add all notes to collection
			notes.add(noteA);
			notes.add(noteB);
			notes.add(noteC);

			// Export notes to view
			return {
				notes: notes,
				actions: {
					add: function() {
						notes.add(new Model.Note());
					},
					remove: function() {
						notes.pop();
					},
					addExisitng: function(e) {
						e.preventDefault();
						notes.fetchById(['rJpTGsaM', 'B1mAzjpz']);
					},
					regex: function() {
						noteA.fetch();
					}
				}
			};
		},

		// View
		view: function(ctrl) {
			console.log('View');
			return m('div', [
				ctrl.notes.map(function(note) {
					return m('div', [
						m('h3', note.title()),
						m('p', note.body()),
						m('p', 'By ' + note.author().name()),
						m('button', {
							onclick: note.save
						}, 'Save'),
						m('span', !note.isNew() ? ' Saved' : ' Click save to save.')
					]);
				}),
				m('hr'),
				m('form', {
					onsubmit: ctrl.actions.addExisitng
				}, [
					m('input'),
					m('button', {
						type: 'submit'
					}, 'Add Existing')
				]),
				m('hr'),
				m('button', {
					onclick: ctrl.actions.add
				}, 'Add'),
				m('button', {
					onclick: ctrl.actions.remove
				}, 'Remove'),
				m('button', {
					onclick: ctrl.actions.regex
				}, 'RegEx')
			]);
		}
	};

	//initialize
	m.mount(document.body, Demo);

})();