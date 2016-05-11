/*!
 * mithril-data v0.1.0
 * A model framework for your Mithril application.
 * 
 * (c) 2016 Kevin Villanueva
 * License: MIT
 */
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* jshint proto: true */

	var _ = __webpack_require__(1),
		m = __webpack_require__(2),
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

	function configure() {
		if (config.methods) {
			strictExtend(BaseModel.prototype, config.methods);
		}
		if (config.controllerMethods) {
			strictExtend(ModelController.prototype, config.controllerMethods);
		}
	}

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
				if (value[property])
					obj[key] = value[property];
			});
			return obj;
		} else {
			return obj ? (obj[property] || obj) : obj;
		}
	}

	function remapToPropertyWrapper(func, property) {
		return function(obj) {
			return func(obj ? (obj[property] || obj) : obj);
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
							var result = src[method](this[distProp], valueA);
							return result !== this[distProp] ? remapToProperty(result, retProp) : result;
						};
						break;
					case 3:
						dist[method] = function(valueA, valueB) {
							if (_.isFunction(valueB))
								valueA = remapToPropertyWrapper(valueB, retProp);
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
				config: this.config,
				background: true
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
		changed: function(models) {
			if (this.__options.redraw || config.redraw) {
				m.redraw();
				console.log('Redrawn', this.name);
			}
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
		add: function(models, unshift) {
			if (!_.isArray(models))
				models = [models];
			var self = this,
				added = false;
			_.each(models, function(model) {
				if (self.__options.model && !(model instanceof self.__options.model))
					throw new Error('Can\'t add to collection. Argument must be instance of model set.');
				if (!(model instanceof BaseModel))
					throw new Error('Can\'t add to collection. Argument must be a model.');
				var existingModel = self.get(model);
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
				this.changed(models);
			return this.size();
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
				this.changed(mixed);
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
		}
	};

	// Add lodash methods.
	var collectionMethods = [
		'forEach', 'map', 'find', 'findIndex', 'findLastIndex', 'filter', 'reject',
		'every', 'some', 'invoke', 'maxBy', 'minBy', 'sortBy', 'groupBy', 'shuffle',
		'size', 'initial', 'without', 'indexOf', 'lastIndexOf', 'difference', 'sample',
		'reverse', 'nth', 'first', 'last', 'toArray'
	];
	addMethods(Collection.prototype, _, collectionMethods, 'collection', '__model');

	/**
	 * Model collection controller.
	 */
	function ModelController() {}

	ModelController.prototype = _.create(Collection.prototype, {
		loadById: function(id, callback) {
			console.log('Loading by id...', id);
		},
		getById: function(id, callback) {
			console.log('Getting by id...', id);
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
	}

	BaseModel.prototype = {
		// Get or set id of model.
		id: function(id) {
			return id ? this[config.keyId](id) : this[config.keyId]();
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
				console.log('save', data);
				self.set(data);
				d.resolve(self);
				if (callback)
					callback(null, self);
			}, function(err) {
				d.reject(err);
				if (callback)
					callback(err);
			});
			return d.promise;
		},
		fetch: function(callback) {
			var self = this,
				d = m.deferred(),
				id = this.id();
			request.get(this.url() + (id ? '/' + id : '')).then(function(data) {
				console.log('fetch', data);
				self.set(data);
				d.resolve(self);
				if (callback)
					callback(null, self);
			}, function(err) {
				d.reject(err);
				if (callback)
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
				if (callback)
					callback(null);
			}, function(err) {
				d.reject(err);
				if (callback)
					callback(err);
			});
			return d.promise;
		}
	};

	// Add lodash methods.
	var objectMethods = ['has', 'keys', 'values', 'invert', 'pick', 'omit', 'toArray'];
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
	if (true) {
		!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
			return exports;
		}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}

	// Export for browser's global.
	if (typeof window !== 'undefined') {
		window.md = exports;
	}

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = _;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = m;

/***/ }
/******/ ]);