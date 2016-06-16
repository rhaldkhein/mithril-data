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
				// data = complete list of models.
				var models = self.createModels(data);
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