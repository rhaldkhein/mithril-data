var _ = require('lodash');
var slice = Array.prototype.slice;
var BaseModel = require('./baseModel');
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
	isConflictExtend: function(objSource, objInject, callback) {
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
		// Need to be this loop (each). To retain value of methods' arguments.
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