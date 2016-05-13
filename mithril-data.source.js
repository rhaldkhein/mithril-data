/* jshint proto: true */

var _ = require('lodash'),
	m = require('mithril'),
	slice = Array.prototype.slice,
	modelCollection = {},
	config = {
		baseUrl: '',
		keyId: 'id',
		redraw: false,
		store: m.request
	};

Object.setPrototypeOf = Object.setPrototypeOf || function(obj, proto) {
	obj.__proto__ = proto;
	return obj;
};

function _prop(store, context, key, callback) {
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
		var ret, refs = context.options.refs,
			args = slice.call(arguments);
		// Check if this key is a reference to another model.
		if (_.isObject(value) && _.has(refs, key)) {
			// This is a reference key
			var existing = modelCollection[refs[key]].get(value);
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

function generateShortId() {
	return ("000000" + (Math.random() * Math.pow(36, 6) << 0).toString(36)).slice(-6);
}

function isConflictExtend(objSource, objInject, callback) {
	var conflict = false,
		value;
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

function remapToProperty(obj, property) {
	if (_.isArray(obj)) {
		_.each(obj, function(value, key) {
			if (value && value[property])
				obj[key] = value[property];
		});
		return obj;
	} else {
		return obj ? (obj[property] || obj) : obj;
	}
}

function remapToPropertyWrapper(func, property) {
	return function(argA, argB, argC, argD) {
		return func(argA ? (argA[property] || argA) : argA, argB ? (argB[property] || argB) : argB, argC, argD);
	};
}

function addMethods(dist, src, methods, distProp, retProp) {
	_.each(methods, function(method) {
		if (src[method]) {
			switch (src[method].length) {
				case 1:
					dist[method] = function() {
						var result = src[method](this[distProp]);
						return result !== this[distProp] ? remapToProperty(result, retProp) : result;
					};
					break;
				case 2:
					dist[method] = function(valueA) {
						if (_.isFunction(valueA))
							valueA = remapToPropertyWrapper(valueA, retProp);
						if (valueA instanceof BaseModel)
							valueA = valueA.__json;
						var result = src[method](this[distProp], valueA);
						return result !== this[distProp] ? remapToProperty(result, retProp) : result;
					};
					break;
				case 3:
					dist[method] = function(valueA, valueB) {
						if (_.isFunction(valueA))
							valueA = remapToPropertyWrapper(valueA, retProp);
						else if (valueA instanceof BaseModel)
							valueA = valueA.__json;
						if (_.isFunction(valueB))
							valueB = remapToPropertyWrapper(valueB, retProp);
						else if (valueB instanceof BaseModel)
							valueB = valueB.__json;
						var result = src[method](this[distProp], valueA, valueB);
						return result !== this[distProp] ? remapToProperty(result, retProp) : result;
					};
					break;
				default:
					dist[method] = function() {
						var result, args = slice.call(arguments);
						args.unshift(this[distProp]);
						result = src[method].apply(src, args);
						return result !== this[distProp] ? remapToProperty(result, retProp) : result;
					};
			}
		}
	});
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
			config: this.config
		};
		if (opt)
			_.assign(options, opt);
		return config.store(options);
	},
	config: function(xhr) {
		xhr.setRequestHeader('Content-Type', 'application/json');
	},
	serializer: function(data) {
		return JSON.stringify(data instanceof BaseModel ? data.getCopy() : data);
	},
	deserializer: function(data) {
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
	this._init(options);
}

Collection.prototype = {
	_init: function(options) {
		if (!this.collection)
			this.collection = [];
		if (!this.__options)
			this.__options = {
				redraw: false
			};
		if (options)
			this.opt(options);
	},
	opt: function(key, value) {
		if (!this.__options)
			this._init();
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
	add: function(models, unshift) {
		if (!_.isArray(models))
			models = [models];
		var self = this,
			added = false,
			existingModel;
		_.each(models, function(model) {
			if (self.__options.model && !(model instanceof self.__options.model))
				throw new Error('Can\'t add to collection. Argument must be instance of model set.');
			if (!(model instanceof BaseModel))
				throw new Error('Can\'t add to collection. Argument must be a model.');
			existingModel = self.get(model);
			if (existingModel) {
				existingModel.set(model);
			} else {
				if (unshift)
					self.collection.unshift(model.getJson());
				else
					self.collection.push(model.getJson());
				model.addCollection(self);
				added = true;
			}
		});
		if (added)
			this.changed();
		return this.size();
	},
	get: function(mixed) {
		// mixed can be id-number, id-string, plain-object or model.
		// NOTE: check if model/object contains id and use it instead.
		// returns a model.
		var jsonModel;
		if (mixed instanceof BaseModel) {
			// mixed is a model and is in this collection.
			return (this.indexOf(mixed.getJson()) > -1) ? mixed : null;
		} else if (_.isObject(mixed)) {
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
		var self = this,
			models = [],
			exist;
		_.transform(mixed, function(res, id) {
			console.log('aaa', id);
			exist = self.get(id);
			if (exist || falsy) {
				res.push(exist);
			}
		}, models);
		return models;
	},
	remove: function(mixed) {
		// mixed can be array of id-number, id-string, plain-object or model.
		if (!_.isArray(mixed))
			mixed = [mixed];
		var self = this,
			lastLength = this.size(),
			removedModels = [],
			matchMix;
		if (!lastLength)
			return;
		_.each(mixed, function(mix) {
			if (!mix)
				throw new Error('Can\'t remove from collection. Argument must be set.');
			if (mix instanceof BaseModel) {
				removedModels.push.apply(removedModels, _.remove(self.collection, function(value) {
					return _.eq(value, mix.getJson());
				}));
			} else if (_.isObject(mix)) {
				removedModels.push.apply(removedModels, _.remove(self.collection, function(value) {
					return _.isMatch(value, mix);
				}));
			} else {
				removedModels.push.apply(removedModels, _.remove(self.collection, function(value) {
					matchMix = {};
					matchMix[config.keyId] = mix;
					return _.isMatch(value, matchMix);
				}));
			}
		});
		_.each(removedModels, function(model) {
			model.__model.removeCollection(self);
		});
		if (lastLength !== this.size())
			this.changed();
		return this.size();
	},
	push: function(models) {
		return this.add(models);
	},
	unshift: function(models) {
		return this.add(models, true);
	},
	shift: function() {
		return this.remove(this.first());
	},
	pop: function() {
		return this.remove(this.last());
	},
	clear: function() {
		this.remove(this.toArray());
	}
};

// Add lodash methods.
var collectionMethods = [
	'forEach', 'map', 'find', 'findIndex', 'findLastIndex', 'filter', 'reject',
	'every', 'some', 'invoke', 'maxBy', 'minBy', 'sortBy', 'groupBy', 'shuffle',
	'size', 'initial', 'without', 'indexOf', 'lastIndexOf', 'difference', 'sample',
	'reverse', 'nth', 'first', 'last', 'toArray', 'slice', 'orderBy', 'transform'
];
addMethods(Collection.prototype, _, collectionMethods, 'collection', '__model');

/**
 * Model collection controller.
 */
function ModelController() {}

ModelController.prototype = _.create(Collection.prototype, {
	url: function() {
		return config.baseUrl + (this.options.url || '/' + this.options.name.toLowerCase());
	},
	create: function(data) {
		if (!_.isArray(data))
			data = [data];
		var self = this,
			existingModel;
		_.each(data, function(modelData) {
			if (!_.isPlainObject(modelData))
				throw new Error('Can\'t create model to collection. Argument must be a plain object.');
			existingModel = self.get(modelData);
			if (existingModel) {
				existingModel.set(modelData);
			} else {
				// Will create and automatically add to this collection.
				// No need to reference.
				new self.__options.model(modelData);
			}
		});
	},
	fetchById: function(ids, callback) {
		console.log('Loading by ids...', ids);
		// 1. Make sure that models (by ids) are in this collection.
		// 2. If not, load those are not in.
		if (!ids)
			throw new Error('Collection can\'t fetch. Id must be set.');
		var self = this,
			d = m.deferred(),
			existing = [];
		if (!_.isArray(ids))
			ids = [ids];
		// Fill up existing models.
		this.transform(function(result, model) {
			if (model.id()) {
				result.push(model.id());
			}
		}, existing);
		// Start loading and resolving.
		var toLoad = _.pullAll(ids, existing);
		if (!_.isEmpty(toLoad)) {
			request.get(this.url(), toLoad).then(function(data) {
				self.create(data)
				d.resolve();
				if (_.isFunction(callback))
					callback(null);
			}, function(err) {
				d.resolve(err);
				if (_.isFunction(callback))
					callback(err);
			});
		} else {
			d.resolve();
			if (_.isFunction(callback))
				callback(null);
		}
		return d.promise;
	},
	fetchWhere: function(predicate) {

	}
});


/**
 * Base model & its prototype.
 */
function BaseModel() {
	this.__options = {
		redraw: false
	};
	this.__collections = [];
	this.__cid = generateShortId();
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
		var self = this,
			refs = this.options.refs || {},
			isModel = key instanceof BaseModel,
			existing;
		if (isModel || _.isPlainObject(key)) {
			_.each(key, function(oValue, oKey) {
				if (_.startsWith(oKey, '__') || !_.isFunction(self[oKey]))
					return;
				if (_.isObject(oValue) && _.has(refs, oKey)) {
					// Check first if we have the document in collection.
					// If so, reference it to that model.
					existing = modelCollection[refs[oKey]].get(oValue);
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
	// Create or update json representation of this model.
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
			if (_.startsWith(key, '__'))
				return;
			var value = this[key]();
			this.__json[key] = value instanceof BaseModel ? value.getJson() : value;
		} else {
			// Update all props.
			_.each(this, function(jValue, jKey) {
				// Note that jValue is _prop function.
				// And must be a function _prop.
				if (!_.isFunction(jValue) || _.startsWith(jKey, '__'))
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
		var obj = {};
		_.each(this.getJson(), function(value, key) {
			if (_.startsWith(key, '__'))
				return;
			if (value.__model && value.__model instanceof BaseModel)
				obj[key] = value.__model.get();
			else
				obj[key] = value;
		});
		return obj;
	},
	opt: function(key, value) {
		if (_.isObject(key))
			_.assign(this.__options, key);
		else
			this.__options[key] = value || true;
	},
	save: function(callback) {
		var self = this,
			d = m.deferred(),
			req = this.id() ? request.put : request.post;
		req.call(request, this.url(), this).then(function(data) {
			self.set(data);
			d.resolve(self);
			if (_.isFunction(callback))
				callback(null, self);
		}, function(err) {
			d.reject(err);
			if (_.isFunction(callback))
				callback(err);
		});
		return d.promise;
	},
	fetch: function(callback) {
		var self = this,
			d = m.deferred(),
			id = this.id();
		request.get(this.url() + (id ? '/' + id : '')).then(function(data) {
			self.set(data);
			d.resolve(self);
			if (_.isFunction(callback))
				callback(null, self);
		}, function(err) {
			d.reject(err);
			if (_.isFunction(callback))
				callback(err);
		});
		return d.promise;
	},
	remove: function(callback) {
		var self = this,
			d = m.deferred(),
			id = this.id();
		request.delete(this.url() + (id ? '/' + id : '')).then(function(data) {
			// Remove this model to all collections.
			_.each(self.__collections, function(collection) {
				collection.remove(self);
			});
			d.resolve();
			if (_.isFunction(callback))
				callback(null);
		}, function(err) {
			d.reject(err);
			if (_.isFunction(callback))
				callback(err);
		});
		return d.promise;
	},
	isNew: function() {
		return this.id() ? false : true;
	}
};

// Add lodash methods.
var objectMethods = ['has', 'keys', 'values', 'invert', 'pick', 'omit'];
addMethods(BaseModel.prototype, _, objectMethods, '__json');

/**
 * Model class.
 */
function createModel(options) {
	function Model(dataValues) {
		var self = this,
			data = dataValues || {},
			refs = options.refs || {},
			propDefs = options.props || {},
			existing;

		if (_.isPlainObject(propDefs)) {
			props = _.keys(propDefs);
		} else if (_.isArray(propDefs)) {
			props = propDefs;
			propDefs = {};
		} else {
			throw new Error('`props` must be a plain object or array.');
		}

		// Calling parent class.
		BaseModel.call(this);
		// Create model properties. Values can be null and set later.
		if (props && _.isArray(props)) {
			// Adding props.
			_.each(props, function(value) {
				// 1. Must not starts  with '__'.
				// 2. Omit id in data if you configure different id field.
				if (_.startsWith(value, '__') || ('id' === value && value !== config.keyId))
					return;
				// Make sure that it does not create conflict with
				// internal reserved keywords.
				if (!_.hasIn(self, value) || 'id' === value) {
					if (_.isObject(data[value]) && _.has(refs, value)) {
						// This field is reference to another model.
						// Create the another model and link to this model.
						existing = modelCollection[refs[value]].get(data[value]);
						if (existing) {
							existing.set(data[value]);
							self[value] = _prop(existing, self, value, self.changed);
						} else {
							self[value] = _prop(new modelCollection[refs[value]](data[value]) || null, self, value, self.changed);
						}
					} else {
						// Use default if data is not available.
						self[value] = _prop(data[value] || propDefs[value] || null, self, value, self.changed);
					}
				} else {
					throw new Error('`' + value + '` property field is not allowed.');
				}
			});
			// Check if it contains user defined id.
			if (!_.has(this, config.keyId)) {
				this[config.keyId] = _prop();
			}
			// Successfully created a model. Add to collection.
			modelCollection[this.options.name].add(this);
		}
	}
	// Make sure that it options.methods does not create
	// conflict with internal methods.
	var conflict = isConflictExtend(BaseModel.prototype, options.methods);
	if (conflict) {
		throw new Error('`' + conflict + '` method is not allowed.');
	}
	// Attach the options to model constructor.
	Model.options = options;
	// Extend from base model prototype.
	Model.prototype = _.create(BaseModel.prototype, _.extend(options.methods || {}, {
		options: options,
	}));
	// Link model controller prototype.
	Object.setPrototypeOf(Model, ModelController.prototype);
	// Return the model.
	return Model;
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
	modelConstructor._init(_.assign({
		redraw: false,
		model: modelConstructor
	}, ctrlOptions));
	return modelConstructor;
};

// Export configurator.
exports.config = function(userConfig) {
	// Compile configuration.
	_.extend(config, userConfig);
	// Run configure.
	configure();
};

// Export class Collection.
exports.Collection = Collection;

// Export our custom m.prop.
exports.prop = _prop;

// Export our custom request controller.
exports.request = request;

// Export for AMD & browser's global.
if (typeof define === 'function' && define.amd) {
	define(function() {
		return exports;
	});
}

// Export for browser's global.
if (typeof window !== 'undefined') {
	window.md = exports;
}