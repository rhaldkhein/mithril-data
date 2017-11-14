(function() {

    window.Model = {};

    var STORE;

    function reset() {
        window.STORE = STORE = {};
        STORE.user = {};
        STORE.note = {};
        STORE.folder = {};
        STORE.cacheuser = {};
    }

    reset();


    md.defaultConfig({
        store: function(rawData) {
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    // console.log(rawData.method + ':' + rawData.url, rawData.data);
                    var model = rawData.url.replace('/', '');
                    // console.log(model);
                    switch (rawData.method + ':' + rawData.url) {
                        case 'GET:/exist':
                            resolve('ok');
                            break;
                        case 'GET:/clear':
                            reset();
                            resolve('ok');
                            break;
                        case 'POST:/user':
                        case 'POST:/cacheuser':
                        case 'POST:/folder':
                            var data = _.assign({
                                id: _.uniqueId('serverid')
                            }, JSON.parse(rawData.serialize(rawData.data)));
                            STORE[model][data.id] = data;
                            resolve(rawData.deserialize(JSON.stringify(STORE[model][data.id])));
                            break;
                        case 'PUT:/user':
                        case 'PUT:/cacheuser':
                        case 'PUT:/folder':
                            var data = JSON.parse(rawData.serialize(rawData.data));
                            if (_.has(STORE[model], data.id)) {
                                STORE[model][data.id] = data;
                                resolve(rawData.deserialize(JSON.stringify(STORE[model][data.id])));
                            } else if (data.id) {
                                var data = _.assign({}, JSON.parse(rawData.serialize(rawData.data)));
                                STORE[model][data.id] = data;
                                resolve(rawData.deserialize(JSON.stringify(STORE[model][data.id])));
                            } else {
                                reject(new Error('Model does not exist!'));
                            }
                            break;
                        case 'GET:/user':
                        case 'GET:/cacheuser':
                        case 'GET:/folder':
                            var data = rawData.data;
                            if (_.isPlainObject(data) && data.id) {
                                // Single user
                                if (_.has(STORE[model], data.id)) {
                                    resolve(rawData.deserialize(STORE[model][data.id]));
                                } else {
                                    reject(new Error('Model ' + data.id + ' does not exist!'));
                                }
                            } else {
                                if (!_.isEmpty(data)) {
                                    // Selected users
                                    resolve(rawData.deserialize(
                                        JSON.stringify(
                                            _.transform(data, function(result, id) {
                                                if (STORE[model][id])
                                                    result.push(STORE[model][id]);
                                            }, []))));
                                } else {
                                    // Return all users
                                    resolve(
                                        rawData.deserialize(
                                            JSON.stringify(
                                                _.values(STORE[model]))));
                                }
                            }
                            break;
                        case 'DELETE:/user':
                        case 'DELETE:/cacheuser':
                        case 'DELETE:/folder':
                            var data = JSON.parse(rawData.serialize(rawData.data));
                            if (data && data.id) {
                                delete STORE[model][data.id];
                                resolve(
                                    rawData.deserialize(
                                        JSON.stringify({
                                            err: false
                                        })));
                            } else {
                                reject(new Error('ID is required!'));
                            }
                            break;
                        case 'GET:/users/wrap':
                            // Return all users
                            resolve({
                                outer: {
                                    inner: {
                                        items: rawData.deserialize(JSON.stringify(_.values(STORE.user)))
                                    }
                                }
                            });
                            break;
                        case 'GET:/undefined':
                        	resolve(undefined);
                            break;
                        default:
                            reject(new Error('Unknown request'));
                    }
                }, 100);
            });
        }
    });

})();