/**
 * Model Constructor
 */

var store = require('./store');
var Collection = require('./collection');

function ModelConstructor() {}

// Export class.
module.exports = ModelConstructor;

// Prototype methods.
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
	createModels: function(data) {
		if (!_.isArray(data))
			data = [data];
		for (var i = 0; i < data.length; i++) {
			if (!_.isPlainObject(data[i]))
				throw new Error('Plain object required');
			data[i] = new this(data[i]);
		}
		return data;
	},
	pull: function(url, data, options, callback) {
		if (_.isFunction(data)) {
			callback = data;
			data = undefined;
		} else if (_.isFunction(options)) {
			callback = options;
			options = undefined;
		}
		var self = this;
		var d = m.deferred();
		store.get(url, data, options)
			.then(function(data) {
				// `data` can be either array of model or object with
				// additional information (like total result and pagination)
				// and a property with value of array of models
				var models;
				if (options && options.dataPath) {
					models = self.createModels(_.get(data, options.dataPath));
					data[options.dataPath] = models;
				} else {
					models = self.createModels(data);
				}
				self.__flagSaved(models);
				// Resolve the raw data from server as it might contain additional information
				d.resolve(data);
				if (_.isFunction(callback)) callback(null, data);
			}, function(err) {
				d.reject(err);
				if (_.isFunction(callback)) callback(err);
			});
		return d.promise;
	}
};