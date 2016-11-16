var _ = require('lodash');
var m = require('mithril');
var config = require('./global').config;
var modelConstructors = require('./global').modelConstructors;
var BaseModel = require('./baseModel');
var ModelConstructor = require('./modelConstructor');
var util = require('./util');
var Collection = require('./collection');

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
		// var refs = schema.refs;
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
	return 'v0.3.1';//version
};

// Export class Collection.
exports.Collection = require('./collection');

// Export class State.
exports.State = require('./state');

// Export our own store controller.
exports.store = require('./store');

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
if (typeof define === 'function' && define.amd) {
	define(function() {
		return exports;
	});
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