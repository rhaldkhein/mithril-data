/**
 * State
 */
var _ = require('lodash');
var m = require('mithril');
var defaultKey = '__key__';

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
	var state = {};
	for (var prop in signature) {
		state[prop] = m.prop(signature[prop]);
	}
	return state;
};

// Prototype
State.prototype = {
	set: function(key) {
		if (!key)
			key = defaultKey;
		if (!this.map[key]) {
			this.map[key] = {
				factory: m.prop(this)
			};
			for (var prop in this.signature) {
				if (prop === 'factory')
					throw new Error('State key `factory` is not allowed.');
				this.map[key][prop] = m.prop(this.signature[prop]);
			}
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