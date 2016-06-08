'use strict';

const _ = require('lodash'),
	path = require('path'),
	express = require('express'),
	app = express(),
	bodyparser = require('body-parser'),
	shortid = require('shortid');

app.use(express.static(__dirname));
app.use(express.static(path.resolve(__dirname, '../..')));

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
	extended: true
}));

// ------------------------------------------------

let notes = {};

app.post('/note', function(req, res) {
	let data = _.assign({
		id: shortid.generate()
	}, req.body);
	notes[data.id] = data;
	res.json(data);
	// console.log(_.keys(notes));
	// console.log(_.size(notes));
});

app.put('/note', function(req, res) {
	if (!req.body.id) {
		res.status(400).json({
			error: 'ID is required!'
		});
	} else {
		let data = _.assign({}, req.body),
			existing = notes[data.id];
		if (existing) {
			_.assign(existing, data);
			res.json(data);
		} else {
			res.status(400).json({
				error: 'Model does not exist!'
			});
		}
	}
	// console.log(_.keys(notes));
});

app.get('/note', function(req, res) {
	// Model fetch, result single document.
	if (req.query) {
		if (req.query.id) {
			let existing = notes[req.query.id];
			if (existing)
				res.json(existing);
			else
				res.status(400).json({
					error: 'Model does not exist!'
				});
		} else {
			let query = _.values(req.query);
			if (!_.isEmpty(query)) {
				// Model query, result array of documents.
				res.json(_.transform(query, function(result, id) {
					if (notes[id])
						result.push(notes[id]);
				}, []));
			} else {
				// Return all notes
				res.json(_.values(notes));
			}
		}
	}
	// console.log(_.keys(notes));
});

app.delete('/note', function(req, res) {
	if (req.query && req.query.id) {
		delete notes[req.query.id];
		res.send({
			err: false
		});
	} else {
		res.status(400).json({
			error: 'ID is required!'
		});
	}
	// console.log(_.keys(notes));
	// console.log(_.size(notes));
});

// ------------------------------------------------

let users = {};

app.post('/user', function(req, res) {
	let data = _.assign({
		id: shortid.generate()
	}, req.body);
	users[data.id] = data;
	res.json(data);
	// console.log(_.keys(users));
	// console.log(_.size(users));
});

app.put('/user', function(req, res) {
	if (!req.body.id) {
		res.status(400).json({
			error: 'ID is required!'
		});
	} else {
		let data = _.assign({}, req.body),
			existing = users[data.id];
		if (existing) {
			_.assign(existing, data);
			res.json(data);
		} else {
			res.status(400).json({
				error: 'Model does not exist!'
			});
		}
	}
	// console.log(_.keys(users));
});

app.get('/user', function(req, res) {
	// Model fetch, result single document.
	if (req.query) {
		if (req.query.id) {
			let existing = users[req.query.id];
			if (existing)
				res.json(existing);
			else
				res.status(400).json({
					error: 'Model does not exist!'
				});
		} else {
			let query = _.values(req.query);
			if (!_.isEmpty(query)) {
				// Model query, result array of documents.
				res.json(_.transform(query, function(result, id) {
					if (users[id])
						result.push(users[id]);
				}, []));
			} else {
				// Return all users
				res.json(_.values(users));
			}
		}
	}
	// console.log(_.keys(users));
});

app.delete('/user', function(req, res) {
	if (req.body && req.body.id) {
		delete users[req.body.id];
		res.send({
			err: false
		});
	} else {
		res.status(400).json({
			error: 'ID is required!'
		});
	}
	// console.log(_.keys(users));
	// console.log(_.size(users));
});

// ------------------------------------------------

app.get('/exist', function(req, res) {
	res.send('ok ' + Math.random().toString(36).slice(-12));
});

app.get('/clear', function(req, res) {
	notes = {};
	users = {};
	res.send('done');
});

let port = 3002;
let host = 'localhost';

app.listen(port, host, function() {
	console.log('Server running... ' + host + ':' + port);
});