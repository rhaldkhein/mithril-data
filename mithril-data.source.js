/* jshint proto: true */

var _ = require('lodash');
var m = require('mithril');
var slice = Array.prototype.slice;
var modelConstructors = {};
var oldConflict;
var config = {
	__TEST__: false,
	baseUrl: '',
	keyId: 'id',
	redraw: false,
	store: m.request
};

Object.setPrototypeOf = Object.setPrototypeOf || function(obj, proto) {
	obj.__proto__ = proto;
	return obj;
};

function configure() {
	if (config.methods) {
		strictExtend(BaseModel.prototype, config.methods);
	}
	if (config.controllerMethods) {
		strictExtend(ModelConstructor.prototype, config.controllerMethods);
	}
}

function isConflictExtend(objSource, objInject, callback) {
	var keys = _.keys(objInject);
	var i = 0;
	for (; i < keys.length; i++) {
		if (_.hasIn(objSource, keys[i])) {
			return keys[i];
		}
	}
	return false;
}

function strictExtend(objSource, objInject) {
	var isConflict = isConflictExtend(objSource, objInject);
	if (isConflict)
		throw new Error('`' + isConflict + '` method / property is not allowed.');
	else
		_.extend(objSource, objInject);
}

function resolveWrapper(func, property) {
	return function(argA, argB, argC, argD) {
		return func(argA ? (argA[property] || argA) : argA, argB ? (argB[property] || argB) : argB, argC, argD);
	};
}

function resolveArguments(args, property) {
	var i = args.length - 1;
	var arg;
	for (; i >= 0; i--) {
		arg = args[i];
		if (_.isFunction(arg))
			args[i] = resolveWrapper(arg, property);
		else if (arg instanceof BaseModel)
			args[i] = arg.__json;
	}
	return args;
}

function resolveResult(result, collection, property) {
	if (result === collection) {
		return result;
	} else {
		if (_.isArray(result)) {
			var i = result.length - 1;
			var value;
			for (; i >= 0; i--) {
				value = result[i];
				if (value && value[property])
					result[i] = value[property];
			}
			return result;
		} else {
			return result ? (result[property] || result) : result;
		}
	}
}

function addMethods(dist, src, methods, distProp, retProp) {
	// Need to be this loop (each). To retain value of `method` argument.
	_.each(methods, function(length, method) {
		if (src[method]) {
			switch (length) {
				case 0:
					dist[method] = function() {
						return resolveResult(src[method](this[distProp]), this[distProp], retProp);
					};
					break;
				case 1:
					dist[method] = function(valueA) {
						if (_.isFunction(valueA))
							valueA = resolveWrapper(valueA, retProp);
						else if (valueA instanceof BaseModel)
							valueA = valueA.__json;
						return resolveResult(src[method](this[distProp], valueA), this[distProp], retProp);
					};
					break;
				case 2:
					dist[method] = function(valueA, valueB) {
						if (_.isFunction(valueA))
							valueA = resolveWrapper(valueA, retProp);
						else if (valueA instanceof BaseModel)
							valueA = valueA.__json;
						if (_.isFunction(valueB))
							valueB = resolveWrapper(valueB, retProp);
						else if (valueB instanceof BaseModel)
							valueB = valueB.__json;
						return resolveResult(src[method](this[distProp], valueA, valueB), this[distProp], retProp);
					};
					break;
				default:
					dist[method] = function() {
						var args = resolveArguments(slice.call(arguments), retProp);
						args.unshift(this[distProp]);
						return resolveResult(src[method].apply(src, args), this[distProp], retProp);
					};
			}
		}
	});
}

function hasValueOfType(obj, type) {
	var keys = _.keys(obj);
	for (var i = 0; i < keys.length; i++) {
		if (obj[keys[i]] instanceof type) {
			return true;
		}
	}
	return false;
}

/**
 * Request controller.
 */

var request = _.create({
	request: function(method, url, data, opt) {
		var options = {
			method: method,
			url: url,
			data: data || {},
			serialize: this.serializer,
			deserialize: this.deserializer,
			config: this.config,
			extract: this.extract
		};
		if (opt)
			_.assign(options, opt);
		if (config.storeConfigOptions)
			config.storeConfigOptions(options);
		return config.store(options);
	},
	config: function(xhr, xhrOptions) {
		if (config.storeConfigXHR)
			config.storeConfigXHR(xhr, xhrOptions);
		xhr.setRequestHeader('Content-Type', 'application/json');
	},
	extract: function(xhr, xhrOptions) {
		if (config.storeExtract) {
			return config.storeExtract(xhr, xhrOptions);
		} else if (xhr.responseText.length) {
			return xhr.responseText
		} else {
			return null
		}
	},
	serializer: function(data) {
		data = data instanceof BaseModel ? data.getCopy() : data;
		if (config.storeSerializer)
			return config.storeSerializer(data);
		else
			return JSON.stringify(data);
	},
	deserializer: function(data) {
		if (config.storeDeserializer)
			return config.storeDeserializer(data);
		else
			return JSON.parse(data);
	},
	get: function(url, data, opt) {
		return this.request('GET', url, data, opt);
	},
	post: function(url, data, opt) {
		return this.request('POST', url, data, opt);
	},
	put: function(url, data, opt) {
		return this.request('PUT', url, data, opt);
	},
	destroy: function(url, data, opt) {
		return this.request('DELETE', url, data, opt);
	}
});

/**
 * Collection
 */

function Collection(options) {
	this.models = [];
	this.__options = {
		redraw: false
	};
	if (options)
		this.opt(options);
	_.bindAll(this, _.union(collectionBindMethods, config.collectionBindMethods));
}

Collection.prototype = {
	opt: function(key, value) {
		if (_.isPlainObject(key))
			_.assign(this.__options, key);
		else
			this.__options[key] = value || true;
	},
	create: function(data) {
		if (!_.isArray(data))
			data = [data];
		var self = this;
		var existingModel;
		var newModels = [];
		_.transform(data, function(result, modelData) {
			if (!_.isPlainObject(modelData))
				throw new Error('Plain object required');
			existingModel = self.get(modelData);
			if (existingModel) {
				existingModel.set(modelData);
			} else {
				if (self.__options.model)
					result.push(new self.__options.model(modelData));
			}
		}, newModels);
		this.addAll(newModels);
		return newModels;
	},
	changed: function() {
		if (this.__options.redraw || config.redraw) {
			m.redraw();
		}
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
			added = true;
		}
		if (added && !silent)
			this.changed();
		return added;
	},
	addAll: function(models, unshift, silent) {
		if (!_.isArray(models))
			models = [models];
		var added = false;
		var i = 0;
		var model;
		for (; i < models.length; i++) {
			if (this.add(models[i], unshift, true))
				added = true;
		}
		if (added && !silent)
			this.changed();
		return added;
	},
	get: function(mixed) {
		// mixed can be id-number, id-string, plain-object or model.
		// NOTE: check if model/object contains id and use it instead.
		// returns a model.
		var jsonModel;
		if (mixed instanceof BaseModel) {
			// mixed is a model and is in this collection.
			return (this.indexOf(mixed.getJson()) > -1) ? mixed : null;
		} else if (_.isObjectLike(mixed)) {
			if (mixed[config.keyId])
				mixed = mixed[config.keyId];
			else
				return this.find(mixed) || null;
		}
		jsonModel = this.find([config.keyId, mixed]);
		return jsonModel || null;
	},
	getAll: function(mixed, falsy) {
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
		var self = this;
		var lastLength = this.size();
		var removedModels = [];
		var matchMix;
		if (!lastLength)
			return;
		// for (var i = 0, mix; i < mixed.length; i++) {
		// 	mix = mixed[i];
		// 	if (!mix)
		// 		throw new Error('Can\'t remove from collection. Argument must be set.');
		// 	if (mix instanceof BaseModel) {
		// 		removedModels.push.apply(removedModels, _.remove(this.models, function(value) {
		// 			return _.eq(value, mix.getJson());
		// 		}));
		// 	} else if (_.isObjectLike(mix)) {
		// 		removedModels.push.apply(removedModels, _.remove(this.models, function(value) {
		// 			return _.isMatch(value, mix);
		// 		}));
		// 	} else {
		// 		removedModels.push.apply(removedModels, _.remove(this.models, function(value) {
		// 			matchMix = {};
		// 			matchMix[config.keyId] = mix;
		// 			return _.isMatch(value, matchMix);
		// 		}));
		// 	}
		// }
		_.each(mixed, function(mix) {
			if (!mix)
				throw new Error('Can\'t remove from collection. Argument must be set.');
			if (mix instanceof BaseModel) {
				removedModels.push.apply(removedModels, _.remove(self.models, function(value) {
					return _.eq(value, mix.getJson());
				}));
			} else if (_.isObjectLike(mix)) {
				removedModels.push.apply(removedModels, _.remove(self.models, function(value) {
					return _.isMatch(value, mix);
				}));
			} else {
				removedModels.push.apply(removedModels, _.remove(self.models, function(value) {
					matchMix = {};
					matchMix[config.keyId] = mix;
					return _.isMatch(value, matchMix);
				}));
			}
		});
		_.each(removedModels, function(model) {
			model.__model.detachCollection(self);
		});
		if (lastLength !== this.size() && !silent)
			this.changed();
		return this.size();
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
		this.remove(this.toArray(), silent);
	},
	pluck: function(key) {
		var plucked = [];
		this.transform(function(_pluck, model) {
			_pluck.push(model[key]());
		}, plucked);
		return plucked;
	},
	destroy: function() {
		this.clear(true);
		this.dispose();
	},
	dispose: function() {
		var keys = _.keys(this);
		var i = 0;
		if (this.__options.model)
			this.__options.model = null;
		for (; i < keys.length; i++) {
			this[keys[i]] = null;
		}
	},
	hasModel: function() {
		return this.__options.model ? true : false;
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
			options = null;
		}
		var d = m.deferred();
		if (this.hasModel) {
			var self = this;
			this.model().pull(this.url(), query, options).then(function(models) {
				self.addAll(models);
				d.resolve(models);
				if (_.isFunction(callback)) callback(null, models);
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
	fetchById: function(ids, options, callback) {
		if (_.isFunction(options)) {
			callback = options;
			options = null;
		}
		var self = this;
		var d = m.deferred();
		if (this.hasModel) {
			Model.Note.pullById(ids, options)
				.then(function(models) {
					self.addAll(models);
					d.resolve(models);
					if (_.isFunction(callback)) callback(null, models);
				}, function(err) {
					d.reject(err);
					if (_.isFunction(callback)) callback(err);
				});
		} else {
			d.reject(true);
			if (_.isFunction(callback)) callback(true);
		}
		return d.promise;
	}
};

// Method to bind to Collection object. Use by _.bindAll().
var collectionBindMethods = [];

// Add lodash methods.
var collectionMethods = {
	forEach: 1,
	map: 1,
	find: 1,
	findIndex: 1,
	findLastIndex: 1,
	filter: 1,
	reject: 1,
	every: 1,
	some: 1,
	invoke: 3,
	maxBy: 1,
	minBy: 1,
	sortBy: 1,
	groupBy: 1,
	shuffle: 0,
	size: 0,
	initial: 0,
	without: 1,
	indexOf: 2,
	lastIndexOf: 2,
	difference: 1,
	sample: 0,
	reverse: 0,
	nth: 1,
	first: 0,
	last: 0,
	toArray: 0,
	slice: 1,
	orderBy: 2,
	transform: 2
};
addMethods(Collection.prototype, _, collectionMethods, 'models', '__model');

/**
 * Model collection controller.
 */
function ModelConstructor() {}

ModelConstructor.prototype = {
	__init: function(options) {
		if (this.__options)
			return;
		this.__options = {
			redraw: false
		};
		if (options)
			this.opt(options);
	},
	__flagSaved: function(models) {
		for (i = 0; i < models.length; i++)
			models[i].__saved = true;
	},
	opt: function(key, value) {
		if (!this.__options)
			this.__init();
		if (_.isPlainObject(key))
			_.assign(this.__options, key);
		else
			this.__options[key] = value || true;
	},
	createCollection: function(options) {
		return new Collection(_.assign({
			model: this
		}, options));
	},
	loadById: function(ids, options, callback) {
		// Only downloads from server, without returning the models.
		// Compare which models are existing and download those are not.
		if (_.isFunction(options)) {
			callback = options;
			options = null;
		}
		if (!ids)
			throw new Error('Collection can\'t fetch. Id must be set.');
		if (!_.isArray(ids))
			ids = [ids];
		var self = this;
		var d = m.deferred();
		var existing = [];
		// Get all existing models.
		this.collection.transform(function(result, model) {
			if (model.id()) {
				result.push(model.id());
			}
		}, existing);
		// Start loading all non existing.
		var toLoad = _.pullAll(ids, existing);
		if (!_.isEmpty(toLoad)) {
			request.get(this.collection.url(), toLoad, options)
				.then(function(data) {
					self.__flagSaved(self.create(data));
					d.resolve();
					if (_.isFunction(callback)) callback(null);
				}, function(err) {
					d.reject(err);
					if (_.isFunction(callback)) callback(err);
				});
		} else {
			d.resolve();
			if (_.isFunction(callback)) callback(null);
		}
		return d.promise;
	},
	pullById: function(ids, options, callback) {
		// Fetch from server and return the models.
		if (_.isFunction(options)) {
			callback = options;
			options = null;
		}
		var self = this;
		var d = m.deferred();
		if (!_.isArray(ids))
			ids = [ids];
		this.loadById(ids, options)
			.then(function() {
				// Every model are in collection. Safe to get all.
				var models = self.collection.getAll(ids);
				d.resolve(models);
				if (_.isFunction(callback)) callback(null, models);
			}, function(err) {
				d.reject(err);
				if (_.isFunction(callback)) callback(err);
			});
		return d.promise;
	},
	pull: function(url, data, options, callback) {
		if (_.isFunction(data)) {
			callback = data;
			data = null;
		} else if (_.isFunction(options)) {
			callback = options;
			options = null;
		}
		var self = this;
		var d = m.deferred();
		request.get(url, data, options)
			.then(function(data) {
				// data = complete list of models.
				var models = self.create(data);
				self.__flagSaved(models);
				d.resolve(models);
				if (_.isFunction(callback)) callback(null, models);
			}, function(err) {
				d.reject(err);
				if (_.isFunction(callback)) callback(err);
			});
		return d.promise;
	}
};


/**
 * Base model & its prototype.
 */
function BaseModel() {
	this.__options = {
		redraw: false
	};
	this.__collections = [];
	this.__cid = _.uniqueId('model');
	this.__saved = false;
	this.__json = {
		__model: this
	};
	_.bindAll(this, _.union(modelBindMethods, config.modelBindMethods));
}

BaseModel.prototype = {
	opt: function(key, value) {
		if (_.isPlainObject(key))
			_.assign(this.__options, key);
		else
			this.__options[key] = value || true;
	},
	// Get or set id of model.
	id: function(id) {
		return id ? this[config.keyId](id) : this[config.keyId]();
	},
	cid: function() {
		return this.__cid;
	},
	// Get the full url for request.
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
		if (collection.get(this))
			collection.remove(this);
		// Remove that collection from model's collection.
		if (_.indexOf(this.__collections, collection) > -1)
			_.pull(this.__collections, collection);
	},
	changed: function(value, key) {
		// Redraw by self.
		if (this.__options.redraw || this.options.redraw || config.redraw)
			m.redraw();
		// Propagate change to model's collections.
		_.each(this.__collections, function(collection) {
			collection.changed(this);
		});

	},
	// Sets all or a prop values from passed data.
	set: function(key, value) {
		var self = this;
		var refs = this.options.refs || {};
		var isModel = key instanceof BaseModel;
		var existing;
		if (isModel || _.isPlainObject(key)) {
			_.each(key, function(oValue, oKey) {
				if (!self.__isProp(oKey) || !_.isFunction(self[oKey]))
					return;
				if (isModel && _.isFunction(oValue)) {
					// Id field is not changeable. Update only if not exist.
					if (oKey === config.keyId && self.id())
						return;
					self[oKey](oValue());
				} else {
					self[oKey](oValue || undefined);
				}
			});
			this.changed();
		} else {
			this[key](value || undefined);
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
		var self = this;
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
	save: function(callback) {
		var self = this;
		var d = m.deferred();
		var req = this.id() ? request.put : request.post;
		req.call(request, this.url(), this).then(function(data) {
			self.set(data);
			self.__saved = true;
			d.resolve(self);
			if (_.isFunction(callback)) callback(null, self);
		}, function(err) {
			d.reject(err);
			if (_.isFunction(callback)) callback(err);
		});
		return d.promise;
	},
	fetch: function(callback) {
		var self = this;
		var d = m.deferred();
		var id = this.__getDataId();
		if (id[config.keyId]) {
			request.get(this.url(), id).then(function(data) {
				self.set(data);
				self.__saved = true;
				d.resolve(self);
				if (_.isFunction(callback)) callback(null, self);
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
	destroy: function(callback) {
		// Destroy the model. Will sync to store.
		var self = this;
		var d = m.deferred();
		var id = this.__getDataId();
		if (id[config.keyId]) {
			request.destroy(this.url(), id).then(function(data) {
				this.detach();
				d.resolve();
				if (_.isFunction(callback)) callback(null);
				this.dispose();
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
		// Detach this model to all collection. Including default collection.
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
		for (i = 0; i < props.length; i++) {
			this[props[i]](null)
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
	__isProp: function(key) {
		return _.indexOf(this.options.props, key) > -1;
	},
	__getDataId: function() {
		var dataId = {};
		dataId[config.keyId] = this.id();
		return dataId;
	},
	__gettersetter(value, key) {
		var store = this.__json;
		var ref = this.options.refs[key];
		store[key] = value;

		function prop() {
			var value;
			if (arguments.length) {
				value = arguments[0];
				if (_.isPlainObject(value) && ref) {
					value = new modelConstructors[ref](value);
				}
				if (value instanceof BaseModel) {
					value = value.getJson();
				}
				store[key] = value;
				return value;
			}
			value = store[key];
			if (value && value.__model instanceof BaseModel)
				value = value.__model;
			return value;
		}
		prop.toJSON = function() {
			return store[key];
		}
		return prop;
	}
};

// Method to bind to Model object. Use by _.bindAll().
var modelBindMethods = [];

// Add lodash methods.
var objectMethods = {
	has: 1,
	keys: 0,
	values: 0,
	pick: 1,
	omit: 1
};
addMethods(BaseModel.prototype, _, objectMethods, '__json');

/**
 * Model class.
 */
function createModelConstructor(options) {
	// Resolve model options. Mutates the object.
	resolveModelOptions(options);
	// The model constructor.
	function Model(propValues) {
		var self = this;
		var data = propValues || {};
		var refs = options.refs;
		var props = options.props;
		// Make user id is in prop;
		if (_.indexOf(props, config.keyId) === -1) {
			props.push(config.keyId);
		}
		// Calling parent class.
		BaseModel.call(this);
		// Adding props.
		for (var i = 0, value; i < props.length; i++) {
			value = props[i];
			// 1. Must not starts  with '__'.
			// 2. Omit id in data if you configure different id field.
			if (!this.__isProp(value) || (value === 'id' && value !== config.keyId))
				return;
			// Make sure that it does not create conflict with
			// internal reserved keywords.
			if (!_.hasIn(this, value) || value === 'id') {
				if (_.isPlainObject(data[value]) && _.has(refs, value)) {
					this[value] = this.__gettersetter(new modelConstructors[refs[value]](data[value]) || undefined, value);
				} else {
					// Use default if data is not available.
					this[value] = this.__gettersetter(data[value] || options.defaults[value] || undefined, value);
				}
			} else {
				throw new Error('`' + value + '` property field is not allowed.');
			}
		}
	}
	// Make sure that it options.methods does not create
	// conflict with internal methods.
	var conflict = isConflictExtend(BaseModel.prototype, options.methods);
	if (conflict) {
		throw new Error('`' + conflict + '` method is not allowed.');
	}
	// Attach the options to model constructor.
	Model.modelOptions = options;
	// Extend from base model prototype.
	Model.prototype = _.create(BaseModel.prototype, _.assign(options.methods || {}, {
		options: options,
	}));
	// Link model controller prototype.
	Object.setPrototypeOf(Model, ModelConstructor.prototype);
	// Return the model.
	return Model;
}

function resolveModelOptions(options) {
	options.defaults = options.defaults || {};
	options.props = _.union(options.props || [], _.keys(options.defaults));
	options.refs = options.refs || {};
}

/**
 * Exports
 */

// Export class Collection.
exports.Collection = Collection;

// Export our custom request controller.
exports.request = request;

// Export model instantiator.
exports.model = function(modelOptions, ctrlOptions) {
	modelOptions = modelOptions || {};
	ctrlOptions = ctrlOptions || {};
	if (!modelOptions.name)
		throw new Error('Model name must be set.');
	var modelConstructor = modelConstructors[modelOptions.name] = createModelConstructor(modelOptions);
	modelConstructor.__init(ctrlOptions);
	// modelConstructor.collection = new Collection({
	// 	model: modelConstructor
	// });
	return modelConstructor;
};

// Export configurator.
exports.config = function(userConfig) {
	// Compile configuration.
	_.assign(config, userConfig);
	// Run configure.
	configure();
};

// Return back the old md.
exports.noConflict = function() {
	if (oldConflict) {
		window.md = oldConflict;
		oldConflict = null;
	}
	return window.md;
};

// Return the current version.
exports.version = function() {
	return '<%version%>';
};


// Export for AMD & browser's global.
if (typeof define === 'function' && define.amd) {
	define(function() {
		return exports;
	});
}

// Export for browser's global.
if (typeof window !== 'undefined') {
	// Export private objects for unit testing.
	if (window.__TEST__ && window.mocha && window.chai) {
		exports.__TEST__ = {
			BaseModel: BaseModel,
			ModelConstructor: ModelConstructor
		};
	}
	if (window.md)
		oldConflict = window.md;
	window.md = exports;
}