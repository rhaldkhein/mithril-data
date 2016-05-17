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

let notes = {};

app.post('/note', function(req, res) {
	let data = _.assign({
		id: shortid.generate()
	}, req.body);
	notes[data.id] = data;
	res.json(data);
	console.log(_.keys(notes));
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
	console.log(_.keys(notes));
});

app.get('/note/:id?', function(req, res) {
	let query = _.values(req.query);
	if (query) {
		// Model query, result array of documents.
		res.json(_.transform(query, function(result, id) {
			if (notes[id])
				result.push(notes[id]);
		}, []));
	} else {
		// Model fetch, result single document.
		if (req.params.id) {
			let existing = notes[req.params.id];
			if (existing)
				res.json(existing);
			else
				res.status(400).json({
					error: 'Model does not exist!'
				});
		} else {
			res.status(400).json({
				error: "ID is required!"
			});
		}
	}
});

app.delete('/note/:id?', function(req, res) {
	if (req.params.id) {
		delete notes[req.params.id];
		res.send({
			err: false
		});
	} else {
		res.status(400).json({
			error: 'ID is required!'
		});
	}
	console.log(_.keys(notes));
});

app.listen(3002, 'localhost', function() {
	console.log('Server running...');
});