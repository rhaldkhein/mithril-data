(function() {


	// Model
	var Model = {};

	Model.User = md.model({
		name: 'User',
		props: ['name', 'profile']
	});

	Model.Note = md.model({
		name: 'Note',
		props: {
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


	var Demo = {

		// Controller
		controller: function() {

			// Create notes collection
			var notes = new md.Collection();

			console.log(notes);

			// Create user for notes
			var user = new Model.User();
			user.name('User Foo');

			// Create first note
			var noteA = new Model.Note();
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
			
			Model.Note.loadById([1, 2, 3]);

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
					}
				}
			};
		},

		// View
		view: function(ctrl) {
			return m('div', [
				ctrl.notes.map(function(note) {
					return m('div', [
						m('h3', note.title()),
						m('p', note.body()),
						m('p', 'By ' + note.author().name())
					]);;
				}),
				m("button", {
					onclick: ctrl.actions.add
				}, "Add"),
				m("button", {
					onclick: ctrl.actions.remove
				}, "Remove")
			]);
		}
	};

	//initialize
	m.mount(document.body, Demo);

})();