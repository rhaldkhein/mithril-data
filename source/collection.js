/**
 * Collection
 */

var _ = require('lodash');
var m = require('mithril');
var util = require('./util');
var config = require('./global').config;
var BaseModel = require('./baseModel');
var State = require('./state');

function Collection(options) {
	this.models = [];
	this.__options = {
		redraw: false,
		_cache: false
	};
	if (options)
		this.opt(options);
	var state = this.__options.state;
	if (state) {
		if (!(state instanceof State)) {
			state = new State(state);
		}
		this.__state = state;
	}
	_.bindAll(this, _.union(collectionBindMethods, config.collectionBindMethods));
	this.__fetching = false;
}

// Export class.
module.exports = Collection;

// Prototype methods.
Collection.prototype = {
	opt: function(key, value) {
		if (_.isPlainObject(key))
			_.assign(this.__options, key);
		else
			this.__options[key] = _.isUndefined(value) ? true : value;
	},
	add: function(model, unshift, silent) {
		if (!(model instanceof BaseModel) || (this.__options.model && !(model instanceof this.__options.model)))
			throw new Error('Must be a model or an instance of set model');
		var existingModel = this.get(model);
		var added = false;
		if (existingModel) {
			existingModel.set(model);
		} else {
			if (unshift)
				this.models.unshift(model.getJson());
			else
				this.models.push(model.getJson());
			model.attachCollection(this);
			if (this.__state)
				this.__state.set(model.lid());
			added = true;
		}
		if (added && !silent)
			this.__update();
		return added;
	},
	addAll: function(models, unshift, silent) {
		if (!_.isArray(models))
			models = [models];
		var added = false;
		var i = 0;
		for (; i < models.length; i++) {
			if (this.add(models[i], unshift, true))
				added = true;
		}
		if (added && !silent)
			this.__update();
		return added;
	},
	create: function(data, opts) {
		if (!_.isArray(data))
			data = [data];
		var newModels = [];
		var existingModel;
		var modelData;
		var i = 0;
		for (; i < data.length; i++) {
			modelData = data[i];
			if (!_.isPlainObject(modelData))
				throw new Error('Plain object required');
			existingModel = this.get(modelData);
			if (existingModel) {
				existingModel.set(modelData, true);
			} else {
				// TODO: Check to use cache
				if (this.__options.model)
					newModels.push(this.__options.model.create(modelData, opts));
				// newModels.push(new this.__options.model(modelData));
			}
		}
		this.addAll(newModels);
		return newModels;
	},
	get: function(mixed) {
		// mixed can be id-number, id-string, plain-object or model.
		// NOTE: check if model/object contains id and use it instead.
		// returns a model.
		var jsonModel;
		if (mixed instanceof BaseModel) {
			// mixed is a model and is in this collection.
			return this.contains(mixed) ? mixed : undefined;
		} else if (_.isObject(mixed)) {
			// Use `isObject` to include functions.
			if (mixed[config.keyId])
				mixed = mixed[config.keyId];
			else
				return this.find(mixed) || undefined;
		}
		jsonModel = this.find([config.keyId, mixed]);
		return jsonModel || undefined;
	},
	getAll: function(mixed, falsy) {
		// Note that this will not get all matched.
		// Will only get the first match of each array item.
		if (!_.isArray(mixed))
			mixed = [mixed];
		var models = [];
		var i = 0;
		var exist;
		for (; i < mixed.length; i++) {
			exist = this.get(mixed[i]);
			if (exist || falsy) {
				models.push(exist);
			}
		}
		return models;
	},
	remove: function(mixed, silent) {
		// mixed can be array of id-number, id-string, plain-object or model.
		if (!_.isArray(mixed))
			mixed = [mixed];
		var lastLength = this.size();
		var removedModels = [];
		var matchMix;
		var mix;
		var i;
		if (!lastLength)
			return;
		for (i = 0; i < mixed.length; i++) {
			mix = mixed[i];
			if (!mix)
				throw new Error('Can\'t remove from collection. Argument must be set.');
			if (mix instanceof BaseModel) {
				removedModels.push.apply(removedModels, _.remove(this.models, function(value) {
					return _.eq(value, mix.getJson());
				}));
			} else if (_.isObjectLike(mix)) {
				removedModels.push.apply(removedModels, _.remove(this.models, function(value) {
					return _.isMatch(value, mix);
				}));
			} else {
				removedModels.push.apply(removedModels, _.remove(this.models, function(value) {
					matchMix = {};
					matchMix[config.keyId] = mix;
					return _.isMatch(value, matchMix);
				}));
			}
		}
		var model;
		for (i = 0; i < removedModels.length; i++) {
			model = removedModels[i].__model;
			model.detachCollection(this);
			if (this.__state)
				this.__state.remove(model.lid());
		}
		if (lastLength !== this.size()) {
			if (!silent)
				this.__update();
			return true;
		}
		return false;
	},
	push: function(models, silent) {
		return this.addAll(models, silent);
	},
	unshift: function(models, silent) {
		return this.addAll(models, true, silent);
	},
	shift: function(silent) {
		var model = this.first();
		this.remove(model, silent);
		return model;
	},
	pop: function(silent) {
		var model = this.last();
		this.remove(model, silent);
		return model;
	},
	clear: function(silent) {
		var i, item, items = this.toArray(),
			len = items.length;
		for (i = 0; i < len; i++) {
			item = items[i];
			item.detachCollection(this);
			if (this.__state) this.__state.remove(item.lid());
		}
		if (len !== this.size()) {
			if (!silent) this.__update();
			return true;
		}
		return false;
	},
	pluck: function(key) {
		var plucked = [],
			isId = (key === 'id');
		for (var i = 0, models = this.models; i < models.length; i++) {
			plucked.push(isId ? models[i].__model[key]() : models[i][key]);
		}
		return plucked;
	},
	dispose: function() {
		var keys = _.keys(this);
		var i = 0;
		if (this.__options.model)
			this.__options.model = null;
		if (this.__state)
			this.__state.dispose();
		for (; i < keys.length; i++) {
			this[keys[i]] = null;
		}
	},
	destroy: function() {
		this.clear(true);
		this.dispose();
	},
	stateOf: function(mixed) {
		if (this.__state) {
			var model = this.get(mixed);
			if (model)
				return this.__state.get(model.lid());
		}
	},
	contains: function(mixed) {
		if (mixed instanceof BaseModel) {
			// mixed is a model and is in this collection.
			return this.indexOf(mixed.getJson()) > -1;
		} else if (_.isObject(mixed)) {
			// Use `isObject` to include functions.
			// If mixed contains `keyId` then search by id
			if (mixed[config.keyId])
				mixed = mixed[config.keyId];
			else
				return this.findIndex(mixed) > -1;
		}
		return this.findIndex([config.keyId, mixed]) > -1;
	},
	sort: function(fields, orders) {
		if (!_.isArray(fields))
			fields = [fields];
		var sorted;
		if (orders) {
			if (!_.isArray(orders))
				orders = [orders];
			sorted = this.orderBy(fields, orders);
		} else {
			sorted = this.orderBy(fields);
		}
		this.__replaceModels(sorted);
	},
	sortByOrder: function(order, path) {
		if (!path) path = config.keyId;
		this.__replaceModels(this.sortBy([function(item) {
			return order.indexOf(_.get(item, path));
		}]));
	},
	randomize: function() {
		this.__replaceModels(this.shuffle());
	},
	hasModel: function() {
		return !!this.__options.model;
	},
	model: function() {
		return this.__options.model;
	},
	url: function(noBase) {
		var url = noBase ? '' : config.baseUrl;
		if (this.__options.url)
			url += this.__options.url;
		else if (this.hasModel())
			url += this.model().modelOptions.url || '/' + this.model().modelOptions.name.toLowerCase();
		return url;
	},
	fetch: function(query, options, callback) {
		if (_.isFunction(options)) {
			callback = options;
			options = undefined;
		}
		var self = this;
		self.__fetching = true;
		return new Promise(function(resolve, reject) {
			if (self.hasModel()) {
				options = options || {};
				self.model().pull(self.url(), query, options, function(err, response, models) {
					self.__fetching = false;
					if (err) {
						reject(err);
						if (_.isFunction(callback)) callback(err);
					} else {
						if (options.clear)
							self.clear(true);
						self.addAll(models);
						resolve(models);
						if (_.isFunction(callback)) callback(null, response, models);
					}
				});
			} else {
				self.__fetching = false;
				reject(new Error('Collection must have a model to perform fetch'));
				if (_.isFunction(callback)) callback(true);
			}
		});
	},
	isFetching: function() {
		return this.__fetching;
	},
	__replaceModels: function(models) {
		for (var i = models.length - 1; i >= 0; i--) {
			this.models[i] = models[i].__json;
		}
	},
	__update: function(fromModel) {
		// Levels: instance || global
		if (!this.__options._cache && (this.__options.redraw || config.redraw)) {
			// If `fromModel` is specified, means triggered by contained model.
			// Otherwise, triggered by collection itself.
			if (!fromModel) {
				// console.log('Redraw', 'Collection');
				m.redraw();
			}
			return true;
		}
	}
};


// Method to bind to Collection object. Use by _.bindAll().
var collectionBindMethods = [];

// Lodash methods to add.
var collectionMethods = {
	difference: 1,
	every: 1,
	find: 1,
	findIndex: 1,
	findLastIndex: 1,
	filter: 1,
	first: 0,
	forEach: 1,
	indexOf: 2,
	initial: 0,
	invoke: 3,
	groupBy: 1,
	last: 0,
	lastIndexOf: 2,
	map: 1,
	maxBy: 1,
	minBy: 1,
	nth: 1,
	orderBy: 2,
	partition: 1,
	reduce: -1,
	reject: 1,
	reverse: 0,
	sample: 0,
	shuffle: 0,
	size: 0,
	slice: 1,
	sortBy: 1,
	some: 1,
	transform: 2,
	toArray: 0,
	without: 1
};


// Inject lodash method.
util.addMethods(Collection.prototype, _, collectionMethods, 'models', '__model');