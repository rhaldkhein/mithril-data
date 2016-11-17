/*!
 * mithril-data v0.2.6
 * A rich data model library for Mithril javascript framework.
 * https://github.com/rhaldkhein/mithril-data
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

	var __WEBPACK_AMD_DEFINE_RESULT__;var _ = __webpack_require__(1);
	var m = __webpack_require__(2);
	var config = __webpack_require__(3).config;
	var modelConstructors = __webpack_require__(3).modelConstructors;
	var BaseModel = __webpack_require__(4);
	var ModelConstructor = __webpack_require__(10);
	var util = __webpack_require__(6);
	var Collection = __webpack_require__(8);

	Object.setPrototypeOf = Object.setPrototypeOf || function(obj, proto) {
		obj.__proto__ = proto;
		return obj;
	};

	/**
	 * `this.__options` is instance options, registered in `new Model(<values>, <__options>)`.
	 * `this.options` is schema options, registered in `m.model(schema)`.
	 */

	function createModelConstructor(schema) {
		// Resolve model options. Mutates the object.
		resolveSchemaOptions(schema);
		// The model constructor.
		function Model(vals, opts) {
			// Calling parent class.
			BaseModel.call(this, opts);
			// Local variables.
			var data = (this.__options.parse ? this.options.parser(vals) : vals) || {};
			var props = schema.props;
			// var initial;
			// Make user id is in prop;
			if (_.indexOf(props, config.keyId) === -1) {
				props.push(config.keyId);
			}
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
					// Use default if data is not available. Only `undefined` should change to default.
					// In order to accept other falsy value. Like, `false` and `0`.
					this[value] = this.__gettersetter(_.isUndefined(data[value]) ? schema.defaults[value] : data[value], value);
				} else {
					throw new Error('`' + value + '` prop is not allowed.');
				}
			}
		}
		// Make sure that it options.methods does not create
		// conflict with internal methods.
		var conflict = util.isConflictExtend(BaseModel.prototype, schema.methods);
		if (conflict) {
			throw new Error('`' + conflict + '` method is not allowed.');
		}
		// Attach the options to model constructor.
		Model.modelOptions = schema;
		// Extend from base model prototype.
		Model.prototype = _.create(BaseModel.prototype, _.assign(schema.methods || {}, {
			options: schema,
		}));
		// Link model controller prototype.
		Object.setPrototypeOf(Model, ModelConstructor.prototype);
		// Return the model.
		return Model;
	}

	function resolveSchemaOptions(options) {
		options.defaults = options.defaults || {};
		options.props = _.union(options.props || [], _.keys(options.defaults));
		options.refs = options.refs || {};
		options.parser = options.parser || function(data) {
			return data;
		};
	}

	/**
	 * Exports
	 */

	// Return the current version.
	exports.version = function() {
		return 'v0.2.6';//version
	};

	// Export class Collection.
	exports.Collection = __webpack_require__(8);

	// Export class State.
	exports.State = __webpack_require__(9);

	// Export our own store controller.
	exports.store = __webpack_require__(5);

	// Export model instantiator.
	exports.model = function(schemaOptions, ctrlOptions) {
		schemaOptions = schemaOptions || {};
		ctrlOptions = ctrlOptions || {};
		if (!schemaOptions.name)
			throw new Error('Model name must be set.');
		var modelConstructor = modelConstructors[schemaOptions.name] = createModelConstructor(schemaOptions);
		modelConstructor.__init(ctrlOptions);
		return modelConstructor;
	};

	// A way to get a constructor from this scope
	exports.model.get = function(name) {
		return modelConstructors[name];
	};

	// Export configurator
	var defaultConfig = {};
	exports.config = function(userConfig) {
		// Compile configuration.
		_.assign(config, userConfig);
		// Configure prototypes.
		if (config.modelMethods)
			util.strictExtend(BaseModel.prototype, config.modelMethods);
		if (config.constructorMethods)
			util.strictExtend(ModelConstructor.prototype, config.constructorMethods);
		if (config.collectionMethods)
			util.strictExtend(Collection.prototype, config.collectionMethods);
		// Clear
		config.modelMethods = null;
		config.constructorMethods = null;
		config.collectionMethods = null;
	};

	// Option to reset to first initial config.
	exports.resetConfig = function() {
		util.clearObject(config);
		exports.config(defaultConfig);
	};

	// Add config to default config. Does not overwrite the old config.
	exports.defaultConfig = function(defaults, silent) {
		_.assign(defaultConfig, defaults);
		if (!silent)
			exports.resetConfig();
	};

	// Set config defaults.
	exports.defaultConfig({
		baseUrl: '',
		keyId: 'id',
		store: m.request,
		redraw: false,
		cache: false,
		cacheLimit: 100
	});

	// Export for AMD & browser's global.
	if (true) {
		!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
			return exports;
		}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}

	// Export for browser's global.
	if (typeof window !== 'undefined') {
		var oldObject;
		// Return back old md.
		exports.noConflict = function() {
			if (oldObject) {
				window.md = oldObject;
				oldObject = null;
			}
			return window.md;
		};
		// Export private objects for unit testing.
		if (window.__TEST__ && window.mocha && window.chai) {
			exports.__TEST__ = {
				config: config,
				BaseModel: BaseModel,
				ModelConstructor: ModelConstructor
			};
		}
		if (window.md)
			oldObject = window.md;
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

/***/ },
/* 3 */
/***/ function(module, exports) {

	
	exports.config = {};

	exports.modelConstructors = {};

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Base Model
	 */

	var _ = __webpack_require__(1);
	var m = __webpack_require__(2);
	var config = __webpack_require__(3).config;
	var modelConstructors = __webpack_require__(3).modelConstructors;

	function BaseModel(opts) {
		this.__options = {
			redraw: false,
			parse: true
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
	var store = __webpack_require__(5);
	var util = __webpack_require__(6);
	var Collection = __webpack_require__(8);

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
		set: function(key, value, silent) {
			if (_.isString(key)) {
				this[key](value, silent);
			} else {
				this.setObject(key, silent);
			}
		},
		// Sets props by object.
		setObject: function(obj, silent) {
			var isModel = obj instanceof BaseModel;
			if (!isModel && !_.isPlainObject(obj))
				throw new Error('Argument `obj` must be a model or plain object.');
			var _obj = (!isModel && this.__options.parse) ? this.options.parser(obj) : obj;
			var keys = _.keys(_obj);
			for (var i = keys.length - 1, key, val; i >= 0; i--) {
				key = keys[i];
				val = _obj[key];
				if (!this.__isProp(key) || !_.isFunction(this[key]))
					return;
				if (isModel && _.isFunction(val)) {
					this[key](val(), true);
				} else {
					this[key](val, true);
				}
			}
			if (!silent) // silent
				this.__update();
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
				self.set(options && options.path ? _.get(data, options.path) : data);
				self.__saved = true;
				d.resolve(self);
				if (_.isFunction(callback)) callback(null, data, self);
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
					self.set(options && options.path ? _.get(data, options.path) : data);
					self.__saved = true;
					d.resolve(self);
					if (_.isFunction(callback)) callback(null, data, self);
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
		__update: function() {
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
					if (ref) {
						var refConstructor = modelConstructors[ref];
						if (_.isPlainObject(value)) {
							value = refConstructor.create(value);
						} else if ((_.isString(value) || _.isNumber(value)) && refConstructor.__cacheCollection) {
							// Try to find the model in the cache
							value = refConstructor.__cacheCollection.get(value) || value;
						}
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

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1);
	var config = __webpack_require__(3).config;
	var BaseModel = __webpack_require__(4);

	function __config(xhr, xhrOptions) {
		if (config.storeConfigXHR)
			config.storeConfigXHR(xhr, xhrOptions);
		xhr.setRequestHeader('Content-Type', 'application/json');
	}

	function __extract(xhr, xhrOptions) {
		if (config.storeExtract) {
			return config.storeExtract(xhr, xhrOptions);
		} else if (xhr.responseText.length) {
			return xhr.responseText;
		} else {
			return null;
		}
	}

	function __serializer(data) {
		data = data instanceof BaseModel ? data.getCopy() : data;
		if (config.storeSerializer)
			return config.storeSerializer(data);
		else
			return JSON.stringify(data);
	}

	function __deserializer(data) {
		if (config.storeDeserializer) {
			return config.storeDeserializer(data);
		} else {
			try {
				return JSON.parse(data);
			} catch (e) {
				return data;
			}
		}
	}

	module.exports = _.create(null, {
		request: function(url, method, data, opt) {
			var options = {
				method: method || 'GET',
				url: url,
				data: data || {},
				serialize: __serializer,
				deserialize: __deserializer,
				config: __config,
				extract: __extract
			};
			if (opt)
				_.assign(options, opt);
			if (config.storeConfigOptions)
				config.storeConfigOptions(options);
			return config.store(options);
		},
		get: function(url, data, opt) {
			return this.request(url, 'GET', data, opt);
		},
		post: function(url, data, opt) {
			return this.request(url, 'POST', data, opt);
		},
		put: function(url, data, opt) {
			return this.request(url, 'PUT', data, opt);
		},
		destroy: function(url, data, opt) {
			return this.request(url, 'DELETE', data, opt);
		}
	});

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {var _ = __webpack_require__(1);
	var slice = Array.prototype.slice;
	var BaseModel = __webpack_require__(4);
	var hasWindow = typeof window !== 'undefined';

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

	function getNextTickMethod() {
		if (hasWindow && window.setImmediate) {
			return window.setImmediate;
		} else if (typeof process === 'object' && typeof process.nextTick === 'function') {
			return process.nextTick;
		}
		return function(fn) {
			setTimeout(fn, 0);
		};
	}

	module.exports = _.create(null, {
		isBrowser: hasWindow,
		nextTick: getNextTickMethod(),
		clearObject: function(obj) {
			for (var member in obj)
				delete obj[member];
		},
		hasValueOfType: function(obj, type) {
			var keys = _.keys(obj);
			for (var i = 0; i < keys.length; i++) {
				if (obj[keys[i]] instanceof type) {
					return true;
				}
			}
			return false;
		},
		isConflictExtend: function(objSource, objInject) {
			var keys = _.keys(objInject);
			var i = 0;
			for (; i < keys.length; i++) {
				if (_.hasIn(objSource, keys[i])) {
					return keys[i];
				}
			}
			return false;
		},
		strictExtend: function(objSource, objInject) {
			var isConflict = this.isConflictExtend(objSource, objInject);
			if (isConflict)
				throw new Error('`' + isConflict + '` method / property is not allowed.');
			else
				_.extend(objSource, objInject);
		},
		addMethods: function(dist, src, methods, distProp, retProp) {
			// Need to use _.each loop. To retain value of methods' arguments.
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
	});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },
/* 7 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Collection
	 */

	var _ = __webpack_require__(1);
	var m = __webpack_require__(2);
	var util = __webpack_require__(6);
	var config = __webpack_require__(3).config;
	var BaseModel = __webpack_require__(4);
	var State = __webpack_require__(9);

	function Collection(options) {
		this.models = [];
		this.__options = {
			redraw: false
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
			return this.remove(this.toArray(), silent);
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
			if(this.__state)
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
			var d = m.deferred();
			if (this.hasModel()) {
				var self = this;
				options = options || {};
				this.model().pull(this.url(), query, options, function(err, response, models) {
					if (err) {
						d.reject(err);
						if (_.isFunction(callback)) callback(err);
					} else {
						if (options.clear)
							self.clear(true);
						self.addAll(models);
						d.resolve(models);
						if (_.isFunction(callback)) callback(null, response, models);
					}
				});
			} else {
				d.reject(true);
				if (_.isFunction(callback)) callback(true);
			}
			return d.promise;
		},
		__replaceModels: function(models) {
			for (var i = models.length - 1; i >= 0; i--) {
				this.models[i] = models[i].__json;
			}
		},
		__update: function() {
			// Levels: instance || global
			if (this.__options.redraw || config.redraw) {
				m.startComputation();
				util.nextTick(m.endComputation);
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

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * State
	 */
	var _ = __webpack_require__(1);
	var m = __webpack_require__(2);
	var defaultKey = '__key__';
	var privateKeys = ['factory', 'toJson', '_options'];

	function _toJson() {
		var json = {};
		for (var prop in this) {
			if (_.indexOf(privateKeys, prop) === -1) {
				json[prop] = this[prop]();
			}
		}
		return json;
	}

	function createState(signature, state, options, factoryKey) {
		var propVal;
		state._options = _.assign({
			store: m.prop
		}, options);
		for (var prop in signature) {
			if (_.indexOf(privateKeys, prop) > -1)
				throw new Error('State key `' + prop + '` is not allowed.');
			propVal = signature[prop];
			state[prop] = _.isFunction(propVal) ? propVal : state._options.store(propVal, prop, factoryKey);
		}
		return state;
	}

	// Class
	function State(signature, options) {
		if (_.isArray(signature)) {
			this.signature = _.invert(signature);
			for (var prop in this.signature) {
				this.signature[prop] = undefined;
			}
		} else {
			this.signature = signature;
		}
		this._options = options;
		this.map = {};
	}

	// Exports
	module.exports = State;

	// Single state
	State.create = function(signature, options) {
		return createState(signature, {
			toJson: _toJson
		}, options);
	};

	// Prototype
	State.prototype = {
		set: function(key) {
			if (!key)
				key = defaultKey;
			if (!this.map[key]) {
				this.map[key] = createState(this.signature, {
					factory: m.prop(this),
					toJson: _toJson
				}, this._options, key);
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

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Model Constructor
	 */

	var _ = __webpack_require__(1);
	var m = __webpack_require__(2);
	var store = __webpack_require__(5);
	var config = __webpack_require__(3).config;
	var Collection = __webpack_require__(8);

	function ModelConstructor() {}

	// Export class.
	module.exports = ModelConstructor;

	// Prototype methods.
	ModelConstructor.prototype = {
		__init: function(options) {
			if (this.__options)
				return;
			// Set defaults
			this.__options = {
				redraw: false,
				cache: config.cache === true
			};
			// Inject schema level options to "__options"
			if (options)
				this.opt(options);
			// Check cache enabled
			if (this.__options.cache) {
				this.__cacheCollection = new md.Collection({
					model: this
				});
				if (!this.__options.cacheLimit)
					this.__options.cacheLimit = config.cacheLimit;
			}
		},
		__flagSaved: function(models) {
			for (var i = 0; i < models.length; i++)
				models[i].__saved = true;
		},
		opt: function(key, value) {
			if (!this.__options)
				this.__init();
			if (_.isPlainObject(key))
				_.assign(this.__options, key);
			else
				this.__options[key] = _.isUndefined(value) ? true : value;
		},
		// Creates a model. Comply with parsing and caching.
		create: function(values, options) {
			if (!_.isPlainObject(values))
				throw new Error('Plain object required');
			var cachedModel;
			if (this.modelOptions.parser) {
				values = this.modelOptions.parser(values);
			}
			if (this.__options.cache && values[config.keyId]) {
				cachedModel = this.__cacheCollection.get(values);
				if (!cachedModel) {
					cachedModel = new this(values, options);
					this.__cacheCollection.add(cachedModel);
					if (this.__cacheCollection.size() > this.__options.cacheLimit) {
						this.__cacheCollection.shift();
					}
				}
			} else {
				cachedModel = new this(values, options);
			}
			return cachedModel;
		},
		createCollection: function(options) {
			return new Collection(_.assign({
				model: this
			}, options));
		},
		createModels: function(data, options) {
			if (!_.isArray(data))
				data = [data];
			var models = [];
			for (var i = 0; i < data.length; i++) {
				models[i] = this.create(data[i], options);
			}
			return models;
		},
		pull: function(url, data, options, callback) {
			if (_.isFunction(data)) {
				callback = data;
				data = undefined;
			} else if (_.isFunction(options)) {
				callback = options;
				options = data;
				data = undefined;
			}
			var self = this;
			var d = m.deferred();
			store.get(url, data, options)
				.then(function(data) {
					// `data` can be either array of model or object with
					// additional information (like total result and pagination)
					// and a property with value of array of models
					var models = self.createModels(options && options.path ? _.get(data, options.path) : data, options);
					self.__flagSaved(models);
					// Resolve the raw data from server as it might contain additional information
					d.resolve(models);
					if (_.isFunction(callback)) callback(null, data, models);
				}, function(err) {
					d.reject(err);
					if (_.isFunction(callback)) callback(err);
				});
			return d.promise;
		}
	};

/***/ }
/******/ ]);