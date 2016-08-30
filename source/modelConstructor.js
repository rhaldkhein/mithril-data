/**
 * Model Constructor
 */

var store = require('./store');
var config = require('./global').config;
var Collection = require('./collection');

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
		// Inject schema level options
		if (options)
			this.opt(options);
		// Check cache enabled
		if (this.__options.cache) {
			this.__cacheCollection = new md.Collection({
				model: this
			});
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
	createCollection: function(options) {
		return new Collection(_.assign({
			model: this
		}, options));
	},
	createModels: function(data, options) {
		if (!_.isArray(data))
			data = [data];
		var cachedModel, model, models = [];
		for (var i = 0; i < data.length; i++) {
			model = data[i];
			if (!_.isPlainObject(model))
				throw new Error('Plain object required');
			cachedModel = undefined;
			if (options && options.parser) {
				model = this.modelOptions.parsers[options.parser](model);
			}
			if (this.__options.cache && model[config.keyId]) {
				cachedModel = this.__cacheCollection.get(model);
				if (!cachedModel) {
					cachedModel = new this(model);
					this.__cacheCollection.add(cachedModel);
				}
			} else {
				cachedModel = new this(model);
			}
			models[i] = cachedModel;
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