# mithril-data
A rich data model library for Mithril javascript framework.

[![Build Status](https://travis-ci.org/rhaldkhein/mithril-data.svg?branch=master)](https://travis-ci.org/rhaldkhein/mithril-data)

#### Features
* Create brilliant application with **Schema**-based **Model** and **Collection**
* Enriched with **Lodash** methods, integrated into Model & Collection
* **Auto Redraw** on Model & Collection changes
* **State** (View-Model)
* Extensible, Configurable and Customizable
* and many more ...

#### Prerequisite
- [Mithril](http://mithril.js.org/)
- [Lodash](http://lodash.com/)

- - - -

## Schema
```javascript
var userSchema = {
   name : 'User',
   props : ['name', 'age']
}

var noteSchema = {
   name : 'Note',
   props : ['title', 'body', 'author'],
   defaults : {
      title: 'Default Title',
      body: 'Default Body'
   },
   refs : {
      author: 'User'
   },
   url : '/customurl',
   redraw : true
}
```
All available schema options:
* **name** - (string, required) name of the model
* **props** - (string array, required) list of model props
* **defaults** - (object {prop:value}) default value of props
* **refs** - (object {prop:model}) list of references to other models
* **url** - (string) the specific url of the model. defaults to model's `name`
* **redraw** - (boolean) trigger a redraw when a model with this schema is updated. defaults to `false`
* **methods** - (object {name:function}) add custom methods to all models (by schema)
* **parsers** - (object {name:function}) add parser methods

-

- - - -

## Model
```javascript
var User = md.model(userSchema)
var Note = md.model(noteSchema)

var userA = new User()
userA.name('Foo')
userA.age(123)
userA.save(function (err) {
   if (!err)
     console.log('Saved')
})

var noteA = new Note({
   title: 'My Notes'
}, {
   redraw : true
})
noteA.body('A note content')
noteA.author(userA)
noteA.save().then(fnResolve, fnReject)
```

#### new \<ModelConstructor>([initials, options])
Creates an instance of model.
* **initials** - (object {prop:value}) initial values of props
* **options** - (object) specific options to model instance
  * **redraw** - (boolean) redraw 

#### \#\<prop>([value, silent])
Get or set value of prop. If auto-redraw is enabled, pass `true` at the end to set without redrawing.
```javascript
user.name('Foo') // Sets the name to `Foo`
var n = user.name() // Get the name... returns `Foo`
user.name('Bar', true) // Silently sets the name to `Bar` (without redrawing)
```

#### \#opt(key[, value])
Sets an option(s) specific to the model. See `ModelConstructor` for list of options.

#### \#id([strId])
Get or set the ID of model regardless of real ID prop. This is useful if you have different id prop like `_id` (mongodb).
```javascript
// Assumes that you configure `keyId` to `_id`
user._id('Bar') // Sets the id to `Bar`
var id = user.id() // Returns `Bar`
// user.id('Bar') // You can also use this
```

#### \#lid()
Get the local ID of model. This ID is generated automatically when model is created.

#### \#url()
Get the url. It return the combination of `baseUrl` and the models' `url`.

#### \#set(key[, value, silent])
Set a value or multiple values using object on the model. 
```javascript
user.set('name', 'Foo') // Sets single prop
user.set({name: 'Bar', age: 12}) // Sets multiple props using object
user.set(existingModelInstance) // Sets multiple props user existing model instance
// Silent set, will NOT trigger the auto redraw
user.set('age', 34, true) // Pass true at the end
```

#### \#get(key)
Get a value or a copy of all values in object literal format. 
```javascript
user.get('name') // Returns the value of name
user.get() // Returns an object (copy) with all props and values. e.g. {name: "Foo", age: 12}
```

#### \#getCopy([deep])
Get a copy model in object literal format. Additionally, you can set deep to `true` to copy all props recursively.

#### \#attachCollection(collection)
Attach the model to a collection.

#### \#detachCollection(collection)
Detach the model from a collection.

#### \#detach()
Detach the model from ALL associated collections.

#### \#remove()
Triggers `detach` and also `dispose` the object. Make sure you're not using the model anymore.

#### \#isSaved()
A flag to identify the save state. The model is considered saved if it's fresh from store (server or local storage).

#### \#isNew()
A flag to identify if the model is new or not. The model is considered new if it does not have ID and is not saved.

#### \#save([callback])
Saves the model to data store. To check for result, you can use either `callback` or `then`. Callback arguments are `(err, model)`.
```javascript
user.save()
   .then(
      function (model) { console.log('Saved') },
      function (err) { console.log(err) }
   )
   .catch(
      function(catchErr) { console.log(catchErr) }
   )
```

#### \#fetch([callback])
Fetches the model from data store. Model ID required to fetch. This method also accept `callback` or `then`.
```javascript
user.id('abc123')
user.fetch().then( function (model) { /* Success! model now have other prop values */ } );
```

#### \#destroy([callback])
Destroys the model from data store and triggers `remove` method. Also accept `callback` or `then`.

#### \#\<lodash methods>()
Model includes few methods of Lodash. `has`, `keys`, `values`, `pick`, and `omit`. See **Lodash** for info.
```javascript
userA.pick(['name', 'age'])
// Returns an object with only two properties `name` and `age`, excluding others.
```

Note: Following methods are not nesseccary or not recommended. Use with caution.

#### \#dispose()
Disposes the object by `null`-ing all properties of the object. Note that this might not be nesseccary.

#### \#getJson()
Get a reference to model's `__json`, the prop-store of all models' props. Make sure to ONLY read and don't write! 

- - - -

## Collection
```javascript
var userCollection = new md.Collection({
   model : User,
   url : '/usercollectionurl',
   redraw : true
})
userCollection.add(new User())
```

#### new Collection([options])

All available collection options:
* **model** - (model constructor) the associated model to the collection
* **url** - (string) the specific url of the collection. defaults to associated model's `name`
* **redraw** - (boolean) trigger a redraw when the collection is updated. Defaults to `false`
* **state** - (State | object | array) set a state factory (View-Model) for the collection. See `#stateOf()` method and `md.State()` for more info.

> A collection with redraw = `true` will always trigger a `redraw` even though the contained model has redraw = `false`.

> Omitted `model` in option is allowed and will make the collection `generic`. Therefore, some methods will NOT be available, like `create` and `fetch`.

#### \#opt(key[, value])
Sets an option(s) to the collection. See `Collection` for list of options.

#### \#add(model[, unshift, silent])
Adds a model to the collection. Optionally, you can add at the beginning with `unshift` = `true` and silently with `silent` = `true`.

#### \#addAll(models[, unshift, silent])
Adds an array of models to the collection. Optionally, you can set `unshift` and `silent` as well.

#### \#create(objects)
Create and add multiple models to the collection from passed array of objects.
```javascript
userCollection.create([ {name:'Foo'}, {name:'Bar'} ])
```

#### \#get(mixed)
Get a model from collection. Argument `mixed` can be a `number`, `string`, `object` or `model` instance. Returns the first matched only otherwise `undefined`.
```javascript
userCollection.get('abc') 
userCollection.get(123) // If string or number, it will find by Id
userCollection.get({name:'Foo'}) // Will match the first model with name equal to `Foo`
userCollection.get(model) // Will find by model instance, compared with Lodash's `indexOf`
```

#### \#getAll(mixedArr[, falsy])
Get multiple models from collection. Array can contain `mixed` type, same with `get()`. Returns an array of first matched only of each array element. Argument `falsy` will include falsy value like `undifened` in the list, instead of omitting.

#### \#remove(mixed[, silent])
Removes a model from collection. `mixed` can be same with `get()`'s mixed argument.

#### \#push(model[, silent])
Adds a model or array of models at the end.

#### \#unshift(model[, silent])
Adds a model or array of models at the beginning.

#### \#shift([silent])
Removes the model at the beginning.

#### \#pop([silent])
Removes the model at the end.

#### \#clear([silent])
Removes ALL models.

#### \#pluck()
Pluck a prop from each model.
```javascript
userCollection.pluck('id') 
// Returns [123, 456, 789]
```

#### \#contains(mixed)
Returns `true` if the model contains in the collection, otherwise `false`. Argument `mixed` is the same with `get()` method.

#### \#model()
Get the associated model constructor.

#### \#stateOf(mixed)
Get the state of a model in the collection. Argument `mixed` is the same with `get()` method.
```javascript
// Set state signature on creating collection
var col = new md.Collection({
   state : {
      isEditing: true,
      isLoading: false  
   }
})
// Create user
var user = new User()
// Add user to collection
col.add(user);
// Retrieving state value
col.stateOf(user).isEditing() // Returns `true`
// Setting state
col.stateOf(user).isEditing(false) // Sets and returns `false`
```

#### \#url()
Get the url.

#### \#fetch(query[, options, callback])
Query to data store and populate the collection.
```javascript
userCollection.fetch({ age : 30 }).then(function (){
   // Success! `userCollection` now have models with age 30
})
```

#### \#hasModel()
Returns `true` if the collection has associated model, otherwise `false`.

#### \#destroy()
Destroys the collection. Trigger `clear` and `dispose`.

#### \#\<lodash methods>()
Collection includes several methods of Lodash. `forEach`, `map`, `find`, `findIndex`, `findLastIndex`, `filter`, `reject`, `every`, `some`, `invoke`, `maxBy`, `minBy`, `sortBy`, `groupBy`, `shuffle`, `size`, `initial`, `without`, `indexOf`, `lastIndexOf`, `difference`, `sample`, `reverse`, `nth`, `first`, `last`, `toArray`, `slice`, `orderBy`, `transform`. See **Lodash** for info.
```javascript
var filtered = userCollection.filter({age: 30})
// Returns an array of models with age of 30.
```

Note: Following methods are not nesseccary or not recommended. Use with caution.

#### \#dispose()
Disposes the object by `null`-ing all properties of the object. Note that this might not be nesseccary. 

- - - -

## State `View-Model`
Also known as View-Model. See Mithril's view-model description for more info.
```javascript
// Create state factory
var stateFactory = new md.State({
   isLoading: false,
   isEditing: false
})
// Creating states 
stateFactory.set('A');
stateFactory.set('B');
// Using states
var component = {
   controller: function() {
      this.stateA = stateFactory.get('A')
      this.stateA.isEditing(true)
   },
   view: function(ctrl) {
      return m('div', 'Is editing ' + ctrl.stateA.isEditing()) // Displays `Is editing true`
   }
}
```

#### new State(signature)
Creates a new State factory. `signature` can be object or array

#### \#set(key)
Internally creates a new state by `key`.

#### \#get(key)
Get the state by `key`.

#### \#remove(key)
Removes the state by `key`.

#### md.State.create(signature)
Creates a state without instantiating new State factory.
```javascript
// Create state factory
var state = md.State.create({
   isWorking: false
})
state.isWorking() // Get state prop. => false
state.isWorking(true) // Set state prop. => true
```

- - - -

## Configure & Customize
Configuration must be set before using any of `mithril-data`'s functionality.
```javascript
md.config({
   baseUrl : '/baseurl',
   keyId : '_id', // mongodb
   store : customStoreFunction
})
```
All available config options:
* **baseUrl** - (string) the base url
* **keyId** - (string) the custom ID of the model. defaults to `id`
* **redraw** - (boolean) the global redraw flag. default to `false`
* **modelMethods** - (object { methodName : `function()` }) additional methods to bind to `model`'s prototype
* **collectionMethods** - (object { methodName : `function()` }) additional methods to bind to `collection`'s prototype
* **modelBindMethods** - (string array) model's methods to bind to itself. see Lodash `bindAll()`
* **collectionBindMethods** - (string array) collection's methods to bind to itself
* **storeConfigOptions** - (function) a function to `manipulate the options` before sending data to data-store
* **storeConfigXHR** - (function) a function to `manipulate XHR` before sending data to data-store. see Mithril's `m.request` for more info
* **storeExtract** - (function) a function to trigger after receiving data from data-store. see Mithril's `m.request` for more info
* **storeSerializer** - (function) a function that overrides data-store serializer. see Mithril's `m.request` for more info
* **storeDeserializer** - (function) a function that overrides data-store deserializer. see Mithril's `m.request` for more info
* **store** - (function) a function that handles the storing or data. defaults to `m.request`

#### storeConfigOptions
This is useful when you want to modify the `options` object before sending to data-store. One scenario is to create custom url instead of default generated url.
```javascript
user.id('abc123')
user.fetch()
// The default url is `/user?id=abc123` but we want `/user/abc123
md.config({ storeConfigOptions : function (options) {
    options.url = options.url + '/' + options.data.id
    options.data = null // clear the data as we've used it already
}})
```

#### store
A function responsible for storing the data (defaults to `m.request`). An example is, if you want to store data using local storage.
```javascript
var fnLocalStorage = function (data) {
    if (data.method === 'POST') { /* Writing data... */ }
    else if (data.method === 'GET') { /* Reading data... */ }
    else if (data.method === 'DELETE') { /* Deleting data... */ }
    else { /* Do something with other methods */ }
}
md.config({ store : fnLocalStorage})
```
> Just make sure that your custom store should return a promise, or your own promise-like with `then` and `catch` methods.

- - - -

## More

#### md.store
A handy tool that handles request to data-store. The result is through `then` / `catch`.
* **request(url[, method, data, opt])** - creates a request to data-store. the `opt` will override the options when storing to data-store
* **get(url[, data, opt])** - calls`request` with `GET` method, passing the `data` and `opt`
* **post(url[, data, opt])** - calls`request` with `POST` method, passing the `data` and `opt`
* **destroy(url[, data, opt])** - calls`request` with `DELETE` method, passing the `data` and `opt`

#### md.model.get(name)
A way to get a model constructor from other scope. Argument `name` is the model name.

#### md.defaultConfig(config)
Overrides the default config.

#### md.resetConfig()
Resets the config to default. If `defaultConfig()` is used, it will reset to that config.

#### md.noConflict()
Return the old reference to `md`.

#### md.version()
Return the current version.

- - - -

## Installation
```sh
# NPM
npm install mithril-data
# Bower
bower install mithril-data
```
Node / CommonJS:
```javascript
var md = require('mithril-data');
```
HTML: (`md` is automatically exposed to browser's global scope)
```html
<script type="text/javascript" src="lodash.min.js"></script>
<script type="text/javascript" src="mithril.min.js"></script>
<script type="text/javascript" src="mithril-data.min.js"></script>
```

- - - -

### License
MIT




