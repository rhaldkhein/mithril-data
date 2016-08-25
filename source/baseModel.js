/**
 * Base Model
 */

var _ = require('lodash');
var m = require('mithril');
var config = require('./global').config;
var modelConstructors = require('./global').modelConstructors;

function BaseModel(opts) {
	this.__options = {
		redraw: false
	};
	this.__collections = [];
	this.__lid = _.uniqueId('model');
	this.__saved = false;
	this.__json = {
		__model: this
	};
	_.bindAll(this, _.union(modelBindMethods, config.modelBindMethods));
	if (opts)
		this.opt(opts);
}

// Export class.
module.exports = BaseModel;

// Need to require after export. To fix the circular dependencies issue.
var store = require('./store');
var util = require('./util');
var Collection = require('./collection');

// Method to bind to Model object. Use by _.bindAll().
var modelBindMethods = [];

// Lodash methods to add.
var objectMethods = {
	has: 1,
	keys: 0,
	values: 0,
	pick: 1,
	omit: 1
};

// Prototype methods.
BaseModel.prototype = {
	opt: function(key, value) {
		if (_.isPlainObject(key))
			_.assign(this.__options, key);
		else
			this.__options[key] = _.isUndefined(value) ? true : value;
	},
	// Get or set id of model.
	id: function(id) {
		return id ? this[config.keyId](id, true) : this[config.keyId]();
	},
	lid: function() {
		return this.__lid;
	},
	// Get the full url for store.
	url: function() {
		return config.baseUrl + (this.options.url || '/' + this.options.name.toLowerCase());
	},
	// Add this model to collection.
	attachCollection: function(collection) {
		if (!(collection instanceof Collection))
			throw new Error('Argument `collection` must be instance of Collection.');
		var model = collection.get(this);
		if (model && _.indexOf(this.__collections, collection) === -1) {
			// This model exist in collection.
			// Add collection to model's local reference.
			this.__collections.push(collection);
		} else {
			collection.add(this);
		}
	},
	// Remove this model from collection.
	detachCollection: function(collection) {
		if (!(collection instanceof Collection))
			throw new Error('Argument `collection` must be instance of Collection.');
		// Remove this model from collection first.
		if (collection.get(this)) {
			collection.remove(this);
		}
		// Remove that collection from model's collection.
		if (_.indexOf(this.__collections, collection) > -1)
			_.pull(this.__collections, collection);
	},
	// Sets all or a prop values from passed data.
	set: function(obj, value, silent) {
		var isModel = obj instanceof BaseModel;
		if (isModel || _.isPlainObject(obj)) {
			var keys = _.keys(obj);
			for (var i = keys.length - 1, key, val; i >= 0; i--) {
				key = keys[i];
				val = obj[key];
				if (!this.__isProp(key) || !_.isFunction(this[key]))
					return;
				if (isModel && _.isFunction(val)) {
					this[key](val(), true);
				} else {
					this[key](val, true);
				}
			}
			if (!value) // silent
				this.__update();
		} else {
			this[obj](arguments[1], silent);
		}
	},
	// Get all or a prop values in object format. Creates a copy.
	get: function(key) {
		if (key)
			return this[key]();
		else
			return this.getCopy();
	},
	// Retrieve json representation. Including private properties.
	getJson: function() {
		return this.__json;
	},
	// Get a copy of json representation. Removing private properties.
	getCopy: function(deep) {
		var copy = {};
		var keys = _.keys(this.__json);
		for (var i = 0, key, value; i < keys.length; i++) {
			key = keys[i];
			value = this.__json[key];
			if (this.__isProp(key)) {
				if (value && value.__model instanceof BaseModel)
					copy[key] = value.__model.get();
				else
					copy[key] = value;
			}
		}
		return deep ? _.cloneDeep(copy) : copy;
	},
	save: function(options, callback) {
		if (_.isFunction(options)) {
			callback = options;
			options = undefined;
		}
		var self = this;
		var d = m.deferred();
		var req = this.id() ? store.put : store.post;
		req.call(store, this.url(), this, options).then(function(data) {
			self.set(options && options.dataPath ? _.get(data, options.dataPath) : data);
			self.__saved = true;
			d.resolve(data);
			if (_.isFunction(callback)) callback(null, self, data);
		}, function(err) {
			d.reject(err);
			if (_.isFunction(callback)) callback(err);
		});
		return d.promise;
	},
	fetch: function(options, callback) {
		if (_.isFunction(options)) {
			callback = options;
			options = undefined;
		}
		var self = this;
		var d = m.deferred();
		var id = this.__getDataId();
		if (id[config.keyId]) {
			store.get(this.url(), id, options).then(function(data) {
				self.set(options && options.dataPath ? _.get(data, options.dataPath) : data);
				self.__saved = true;
				d.resolve(data);
				if (_.isFunction(callback)) callback(null, self, data);
			}, function(err) {
				d.reject(err);
				if (_.isFunction(callback)) callback(err);
			});
		} else {
			d.reject(true);
			if (_.isFunction(callback)) callback(true);
		}
		return d.promise;
	},
	destroy: function(options, callback) {
		if (_.isFunction(options)) {
			callback = options;
			options = undefined;
		}
		// Destroy the model. Will sync to store.
		var self = this;
		var d = m.deferred();
		var id = this.__getDataId();
		if (id[config.keyId]) {
			store.destroy(this.url(), id, options).then(function() {
				self.detach();
				d.resolve();
				if (_.isFunction(callback)) callback(null);
				self.dispose();
			}, function(err) {
				d.reject(err);
				if (_.isFunction(callback)) callback(err);
			});
		} else {
			d.reject(true);
			if (_.isFunction(callback)) callback(true);
		}
		return d.promise;
	},
	remove: function() {
		this.detach();
		this.dispose();
	},
	detach: function() {
		// Detach this model to all collection.
		var clonedCollections = _.clone(this.__collections);
		for (var i = 0; i < clonedCollections.length; i++) {
			clonedCollections[i].remove(this);
			clonedCollections[i] = null;
		}
	},
	dispose: function() {
		var keys = _.keys(this);
		var props = this.options.props;
		var i;
		this.__json.__model = null;
		for (i = 0; i < props.length; i++) {
			this[props[i]](null);
		}
		for (i = 0; i < keys.length; i++) {
			this[keys[i]] = null;
		}
	},
	isSaved: function() {
		return this.__saved;
	},
	isNew: function() {
		return !(this.id() && this.__saved);
	},
	__update: function(key) {
		// Redraw by self.
		var redrawing;
		// Levels: instance || schema || global
		if (this.__options.redraw || this.options.redraw || config.redraw) {
			m.startComputation();
			redrawing = true;
		}
		// Propagate change to model's collections.
		for (var i = 0; i < this.__collections.length; i++) {
			this.__collections[i].__update(this);
		}
		if (redrawing)
			util.nextTick(m.endComputation);
	},
	__isProp: function(key) {
		return _.indexOf(this.options.props, key) > -1;
	},
	__getDataId: function() {
		var dataId = {};
		dataId[config.keyId] = this.id();
		return dataId;
	},
	__gettersetter: function(initial, key) {
		var store = this.__json;
		var ref = this.options.refs[key];
		// Getter and setter function.
		function prop() {
			var value;
			if (arguments.length) {
				// 0 = value
				// 1 = silent
				value = arguments[0];
				if (_.isPlainObject(value) && ref) {
					value = new modelConstructors[ref](value);
				}
				if (value instanceof BaseModel) {
					value = value.getJson();
				}
				store[key] = value;
				if (!arguments[1])
					this.__update(key);
				return value;
			}
			value = store[key];
			if (value && value.__model instanceof BaseModel) {
				value = value.__model;
			} else if (_.isNil(value) && this.options && !_.isNil(this.options.defaults[key])) {
				// If value is null or undefined and a default value exist.
				// Return that default value which was set in schema.
				value = this.options.defaults[key];
			}

			return value;
		}
		// Add toJSON method to prop.
		prop.toJSON = function() {
			return store[key];
		};
		// Store initial value.
		prop(initial, true);
		return prop;
	}
};

// Inject lodash methods.
util.addMethods(BaseModel.prototype, _, objectMethods, '__json');