(function() {

	window.Model = {};

	var STORE;

	function reset() {
		STORE = {};
		STORE.users = {};
		STORE.notes = {};
	}

	reset();

	md.defaultConfig({
		store: function(rawData) {
			var d = m.deferred();
			setTimeout(function() {
				switch (rawData.method + ':' + rawData.url) {
					case 'GET:/exist':
						d.resolve('ok');
						break;
					case 'GET:/clear':
						reset();
						d.resolve('ok');
						break;
					case 'POST:/user':
						var data = _.assign({
							id: _.uniqueId('mdl')
						}, JSON.parse(rawData.serialize(rawData.data)));
						STORE.users[data.id] = data;
						d.resolve(rawData.deserialize(JSON.stringify(STORE.users[data.id])));
						break;
					case 'PUT:/user':
						var data = JSON.parse(rawData.serialize(rawData.data));
						if (_.has(STORE.users, data.id)) {
							STORE.users[data.id] = data;
							d.resolve(rawData.deserialize(JSON.stringify(STORE.users[data.id])));
						} else {
							d.reject(new Error('Model does not exist!'));
						}
						break;
					case 'GET:/user':
						var data = rawData.data;
						if (_.isPlainObject(data) && data.id) {
							// Single user
							if (_.has(STORE.users, data.id)) {
								d.resolve(rawData.deserialize(STORE.users[data.id]));
							} else {
								d.reject(new Error('Model does not exist!'));
							}
						} else {
							if (!_.isEmpty(data)) {
								// Selected users
								d.resolve(rawData.deserialize(
									JSON.stringify(
										_.transform(data, function(result, id) {
											if (STORE.users[id])
												result.push(STORE.users[id]);
										}, []))));
							} else {
								// Return all users
								d.resolve(
									rawData.deserialize(
										JSON.stringify(
											_.values(STORE.users))));
							}
						}
						break;
					case 'DELETE:/user':
						var data = JSON.parse(rawData.serialize(rawData.data));
						if (data && data.id) {
							delete STORE.users[data.id];
							d.resolve(
								rawData.deserialize(
									JSON.stringify({
										err: false
									})));
						} else {
							d.reject(new Error('ID is required!'));
						}
						break;
					case 'GET:/users/wrap':
						// Return all users
						d.resolve({
							outer: {
								inner: {
									items: rawData.deserialize(JSON.stringify(_.values(STORE.users)))
								}
							}
						});
						break;
					default:
						d.reject(new Error('Unknown request'));
				}
			}, 0);
			return d.promise;
		}
	});

})();