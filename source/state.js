/**
 * State
 */
var _ = require('lodash');
var m = require('mithril');
var defaultKey = '__key__';
var privateKeys = ['toJson', 'factory'];

function toJson() {
	var json = {};
	for (var prop in this) {
		if (_.indexOf(privateKeys, prop) === -1) {
			json[prop] = this[prop]();
		}
	}
	return json;
}

function createState(signature, state) {
	var propVal;
	for (var prop in signature) {
		if (_.indexOf(privateKeys, prop) > -1)
			throw new Error('State key `' + prop + '` is not allowed.');
		propVal = signature[prop];
		state[prop] = _.isFunction(propVal) ? propVal : m.prop(propVal);
	}
	return state;
}

// Class
function State(signature) {
	if (_.isArray(signature)) {
		this.signature = _.invert(signature);
		for (var prop in this.signature) {
			this.signature[prop] = undefined;
		}
	} else {
		this.signature = signature;
	}
	this.map = {};
}

// Exports
module.exports = State;

// Single state
State.create = function(signature) {
	return createState(signature, {
		toJson: toJson
	});
};

// Prototype
State.prototype = {
	set: function(key) {
		if (!key)
			key = defaultKey;
		if (!this.map[key]) {
			this.map[key] = createState(this.signature, {
				factory: m.prop(this),
				toJson: toJson
			});
		}
		return this.map[key];
	},
	get: function(key) {
		if (!key)
			key = defaultKey;
		if (!this.map[key]) {
			this.set(key);
		}
		return this.map[key];
	},
	remove: function(key) {
		if (!key)
			key = defaultKey;
		if (this.map[key]) {
			var b, keys = _.keys(this.map[key]);
			for (b = 0; b < keys.length; b++) {
				this.map[key][keys[b]] = null;
			}
			delete this.map[key];
		}
	},
	dispose: function() {
		var keysThis = _.keys(this);
		var keysMap = _.keys(this.map);
		var keySignature = _.keys(this.signature);
		var a, b;
		for (a = 0; a < keysMap.length; a++) {
			for (b = 0; b < keySignature.length; b++) {
				this.map[keysMap[a]][keySignature[b]] = null;
			}
			this.map[keysMap[a]] = null;
		}
		for (a = 0; a < keysThis.length; a++) {
			this[keysThis[a]] = null;
		}
	}
};