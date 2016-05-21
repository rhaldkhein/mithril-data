/* jshint proto: true */

var _ = require('lodash');
var m = require('mithril');
var slice = Array.prototype.slice;
var modelCollection = {};
var oldConflict;
var config = {
	baseUrl: '',
	keyId: 'id',
	redraw: false,
	store: m.request
};

Object.setPrototypeOf = Object.setPrototypeOf || function(obj, proto) {
	obj.__proto__ = proto;
	return obj;
};

function __prop(store, context, key, callback) {
	var prop = m.prop(store);
	// store, callback
	if (arguments.length === 2) {
		callback = context;
		context = null;
	} else if (arguments.length === 3) {
		// store, context, callback
		callback = key;
		key = null;
	}
	if (!callback)
		return prop;
	return function(value, silent) {
		var args = slice.call(arguments);
		var refs = context.options.refs;
		var ret;
		// Check if this key is a reference to another model.
		if (_.isObjectLike(value) && _.has(refs, key)) {
			// This is a reference key
			var existing = modelCollection[refs[key]].collection.get(value);
			if (existing) {
				existing.set(value);
			} else {
				existing = new modelCollection[refs[key]](value) || null;
			}
			args[0] = value = existing;
		}
		ret = prop.apply(null, args);
		if (args.length && !silent)
			callback.call(context, value, key);
		return ret;
	};
}

function configure() {
	if (config.methods) {
		strictExtend(BaseModel.prototype, config.methods);
	}
	if (config.controllerMethods) {
		strictExtend(ModelController.prototype, config.controllerMethods);
	}
}

function isConflictExtend(objSource, objInject, callback) {
	var conflict = false;
	var value;
	_.each(_.keys(objInject), function(currValue) {
		if (_.hasIn(objSource, currValue)) {
			if (!conflict) {
				conflict = true;
				value = currValue;
			}
		}
	});
	return conflict ? value : conflict;
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
	_.each(methods, function(method) {
		if (src[method]) {
			switch (src[method].length) {
				case 1:
					dist[method] = function() {
						return resolveResult(src[method](this[distProp]), this[distProp], retProp);
					};
					break;
				case 2:
					dist[method] = function(valueA) {
						if (_.isFunction(valueA))
							valueA = resolveWrapper(valueA, retProp);
						else if (valueA instanceof BaseModel)
							valueA = valueA.__json;
						return resolveResult(src[method](this[distProp], valueA), this[distProp], retProp);
					};
					break;
				case 3:
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
	delete: function(url, data, opt) {
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
	_.bindAll(this, collectionBindMethods);
}

Collection.prototype = {
	opt: function(key, value) {
		if (_.isPlainObject(key))
			_.assign(this.__options, key);
		else
			this.__options[key] = value || true;
	},
	changed: function() {
		if (this.__options.redraw || config.redraw) {
			m.redraw();
		}
	},
	add: function(model, unshift, silent) {
		if (!(model instanceof BaseModel) || (this.__options.model && !(model instanceof this.__options.model)))
			throw new Error('Can\'t add to collection. Argument must be a model or an instance of set model.');
		var existingModel = this.get(model);
		var added = false;
		if (existingModel) {
			existingModel.set(model);
		} else {
			if (unshift)
				this.models.unshift(model.getJson());
			else
				this.models.push(model.getJson());
			model.addCollection(this);
			added = true;
		}
		if (added && !silent)
			this.changed();
		return added;
	},
	addAll: function(models, unshift, silent) {
		if (!_.isArray(models))
			models = [models];
		var self = this;
		var added = false;
		_.each(models, function(model) {
			if (self.add(model, unshift, true))
				added = true;
		});
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
		var self = this;
		var models = [];
		var exist;
		_.transform(mixed, function(res, id) {
			exist = self.get(id);
			if (exist || falsy) {
				res.push(exist);
			}
		}, models);
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
			model.__model.removeCollection(self);
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
var collectionBindMethods = ['add', 'addAll'];

// Add lodash methods.
var collectionMethods = [
	'forEach', 'map', 'find', 'findIndex', 'findLastIndex', 'filter', 'reject',
	'every', 'some', 'invoke', 'maxBy', 'minBy', 'sortBy', 'groupBy', 'shuffle',
	'size', 'initial', 'without', 'indexOf', 'lastIndexOf', 'difference', 'sample',
	'reverse', 'nth', 'first', 'last', 'toArray', 'slice', 'orderBy', 'transform'
];
addMethods(Collection.prototype, _, collectionMethods, 'models', '__model');

/**
 * Model collection controller.
 */
function ModelController() {}

ModelController.prototype = {
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
	create: function(data) {
		if (!_.isArray(data))
			data = [data];
		var self = this;
		var existingModel;
		var models = [];
		_.transform(data, function(result, modelData) {
			if (!_.isPlainObject(modelData))
				throw new Error('Can\'t create model to collection. Argument must be a plain object.');
			existingModel = self.collection.get(modelData);
			if (existingModel) {
				existingModel.set(modelData);
				result.push(existingModel);
			} else {
				// Will create and automatically add to the collection.
				result.push(new self.collection.__options.model(modelData));
			}
		}, models);
		return models;
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
	_.bindAll(this, modelBindMethods);
}

BaseModel.prototype = {
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
	addCollection: function(collection) {
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
	removeCollection: function(collection) {
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
		if (value || key)
			this.updateJson(key);
		else
			this.updateJson();
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
				if (!self.isProp(oKey) || !_.isFunction(self[oKey]))
					return;
				if (_.isObjectLike(oValue) && _.has(refs, oKey)) {
					// Check first if we have the document in collection.
					// If so, reference it to that model.
					existing = modelCollection[refs[oKey]].collection.get(oValue);
					if (existing) {
						existing.set(oValue);
						self[oKey](existing, true);
					} else {
						self[oKey](new modelCollection[refs[oKey]](oValue) || null, true);
					}
				} else {
					if (isModel && _.isFunction(oValue)) {
						// Id field is not changeable. Update only if not exist.
						if (oKey === config.keyId && self.id())
							return;
						self[oKey](oValue(), true);
					} else {
						self[oKey](oValue || null, true);
					}
				}
			});
			this.changed();
		} else {
			this[key](value || null);
		}
	},
	// Create or update json representation of this model. Must use this method to update the json.
	updateJson: function(key) {
		// Loop through props and update the json.
		// Create new json object if not exist.
		var self = this;
		if (!this.__json) {
			this.__json = {};
			this.__json.__model = this;
		}
		if (key) {
			// Update single prop.
			if (!this.isProp(key))
				return;
			var value = this[key]();
			this.__json[key] = value instanceof BaseModel ? value.getJson() : value;
		} else {
			// Update all props.
			_.each(this, function(jValue, jKey) {
				// Note that jValue is __prop function.
				// And must be a function __prop.
				if (!self.isProp(jKey) || !_.isFunction(jValue))
					return;
				jValue = jValue();
				if (jValue && !_.isNull(jValue)) {
					self.__json[jKey] = jValue instanceof BaseModel ? jValue.getJson() : jValue;
				}
			});
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
		if (!this.__json)
			this.updateJson();
		return this.__json;
	},
	// Get a copy of json representation. Removing private properties.
	getCopy: function() {
		var self = this;
		var obj = {};
		_.each(this.getJson(), function(value, key) {
			if (!self.isProp(key))
				return;
			if (value.__model && value.__model instanceof BaseModel)
				obj[key] = value.__model.get();
			else
				obj[key] = value;
		});
		return obj;
	},
	opt: function(key, value) {
		if (_.isPlainObject(key))
			_.assign(this.__options, key);
		else
			this.__options[key] = value || true;
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
	remove: function(local, callback) {
		var self = this;
		var d = m.deferred();
		var resolveCallback = function(data) {
			// Remove this model to all collections.
			var clonedCollections = _.clone(self.__collections);
			for (var i = 0; i < clonedCollections.length; i++) {
				clonedCollections[i].remove(self);
				clonedCollections[i] = null;
			}
			d.resolve();
			if (_.isFunction(callback)) callback(null);
		};
		if (local === true) {
			resolveCallback();
			this.dispose();
		} else {
			callback = local;
			var id = this.__getDataId();
			if (id[config.keyId]) {
				request.delete(this.url(), id).then(resolveCallback, function(err) {
					d.reject(err);
					if (_.isFunction(callback)) callback(err);
				});
			} else {
				d.reject(true);
				if (_.isFunction(callback)) callback(true);
			}
		}
		return d.promise;
	},
	isSaved: function() {
		return this.__saved;
	},
	isNew: function() {
		return !(this.id() && this.__saved);
	},
	isProp: function(key) {
		return _.indexOf(this.options.props, key) > -1;
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
	__getDataId: function() {
		var dataId = {};
		dataId[config.keyId] = this.id();
		return dataId;
	}
};

// Method to bind to Model object. Use by _.bindAll().
var modelBindMethods = ['save', 'remove'];

// Add lodash methods.
var objectMethods = ['has', 'keys', 'values', 'invert', 'pick', 'omit'];
addMethods(BaseModel.prototype, _, objectMethods, '__json');

/**
 * Model class.
 */
function createModel(options) {
	// Resolve model options. Mutates the object.
	resolveModelOptions(options);
	// The model constructor.
	function Model(propValues) {
		var self = this;
		var data = propValues || {};
		var refs = options.refs || {};
		var props = options.props || [];
		var defs = options.defaults || {};
		var existing;
		// Make user id is in prop;
		if (_.indexOf(props, config.keyId) === -1) {
			props.push(config.keyId);
		}
		// Calling parent class.
		BaseModel.call(this);
		// Create model properties. Values can be null and set later.
		if (props && _.isArray(props)) {
			// Adding props.
			_.each(props, function(value) {
				// 1. Must not starts  with '__'.
				// 2. Omit id in data if you configure different id field.
				if (!self.isProp(value) || ('id' === value && value !== config.keyId))
					return;
				// Make sure that it does not create conflict with
				// internal reserved keywords.
				if (!_.hasIn(self, value) || 'id' === value) {
					if (_.isObjectLike(data[value]) && _.has(refs, value)) {
						// This field is reference to another model.
						// Create the another model and link to this model.
						existing = modelCollection[refs[value]].collection.get(data[value]);
						if (existing) {
							existing.set(data[value]);
							self[value] = __prop(existing, self, value, self.changed);
						} else {
							self[value] = __prop(new modelCollection[refs[value]](data[value]) || null, self, value, self.changed);
						}
					} else {
						// Use default if data is not available.
						self[value] = __prop(data[value] || defs[value] || null, self, value, self.changed);
					}
				} else {
					throw new Error('`' + value + '` property field is not allowed.');
				}
			});
		}
		// Check if it contains user defined id. (This might not be necessary, as we pushed the keyId already.)
		if (!_.has(this, config.keyId)) {
			this[config.keyId] = __prop();
		}
		// Successfully created a model. Add to collection.
		modelCollection[this.options.name].collection.add(this);
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
	Object.setPrototypeOf(Model, ModelController.prototype);
	// Return the model.
	return Model;
}

function resolveModelOptions(options) {
	// Combine props with defaults keys.
	options.props = _.union(options.props, _.keys(options.defaults));
}

/**
 * Exports
 */

// Export model instantiator.
exports.model = function(modelOptions, ctrlOptions) {
	modelOptions = modelOptions || {};
	ctrlOptions = ctrlOptions || {};
	if (!modelOptions.name)
		throw new Error('Model name must be set.');
	var modelConstructor = modelCollection[modelOptions.name] = createModel(modelOptions);
	modelConstructor.__init(ctrlOptions);
	modelConstructor.collection = new Collection({
		model: modelConstructor
	});
	return modelConstructor;
};

// Export configurator.
exports.config = function(userConfig) {
	// Compile configuration.
	_.assign(config, userConfig);
	// Run configure.
	configure();
};

// Export class Collection.
exports.Collection = Collection;

// Export our custom m.prop.
exports.prop = __prop;

// Export our custom request controller.
exports.request = request;

// Return back the old md.
exports.noConflict = function() {
	if (oldConflict) {
		window.md = oldConflict;
		oldConflict = null;
	}
	return window.md;
};

// Export for AMD & browser's global.
if (typeof define === 'function' && define.amd) {
	define(function() {
		return exports;
	});
}

// Export for browser's global.
if (typeof window !== 'undefined') {
	if (window.md)
		oldConflict = window.md;
	window.md = exports;
}