var _ = require('lodash');
var config = require('./global').config;
var BaseModel = require('./baseModel');

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
	__dereference(data);
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

function __dereference(data) {
	var value;
	for (var key in data) {
		value = data[key];
		if (_.isObject(value)) {
			data[key] = value[config.keyId] || value;
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