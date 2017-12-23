describe('Model Instance', function() {
    'use strict';

    it('is instance of `BaseModel`', function() {
        var user = new Model.User();
        expect(user).to.be.instanceof(md.__TEST__.BaseModel);
    });

    it('create instance with DEFAULT prop values', function() {
        var note = new Model.Note({
            title: 'Foo'
        });
        expect(note.title()).to.be.equal('Foo');
        expect(note.body()).to.be.equal(Model.Note.modelOptions.defaults.body);
        expect(note.author()).to.be.equal(Model.Note.modelOptions.defaults.author);
    });

    it('create instance with defined prop values', function() {
        var user = new Model.User({
            name: 'Foo',
            age: 0,
            active: false
        });
        expect(user.name()).to.be.equal('Foo');
        expect(user.profile()).to.be.undefined;
        expect(user.age()).to.be.equal(0);
        expect(user.active()).to.be.equal(false);
    });

    it('create instance with defined prop values and reference model', function() {
        var noteA = new Model.Note({
            title: 'Foo',
            author: {
                name: 'Bar'
            }
        });
        expect(noteA.title()).to.be.equal('Foo');
        expect(noteA.author()).to.be.instanceof(md.__TEST__.BaseModel);
        expect(noteA.author().name()).to.be.equal('Bar');

        var userB = new Model.User({
            name: 'TestUser'
        });
        var noteB = new Model.Note({
            title: 'TestNote',
            author: userB
        });
        expect(noteB.title()).to.be.equal('TestNote');
        expect(noteB.author()).to.be.instanceof(md.__TEST__.BaseModel);
        expect(noteB.author().name()).to.be.equal('TestUser');
    });

    it('create instance with parser', function() {
        var noteA = new Model.Note({
            wrap: {
                title: 'Title',
                inner: {
                    body: 'Body',
                    author: 'Author'
                }
            }
        }, {
            parse: true
        });
        expect(noteA.title()).to.equal('Title');
        expect(noteA.body()).to.equal('Body');
        expect(noteA.author()).to.equal('Author');
    });

    it('prop defaults to `undefined`', function() {
        var user = new Model.User();
        expect(user.profile()).to.be.undefined;
    });

    it('prop sets `null`', function() {
        var user = new Model.User();
        user.name(null);
        expect(user.name()).to.be.null;
    });

    it('prop sets `undefined`', function() {
        var user = new Model.User();
        user.name(undefined);
        expect(user.name()).to.be.undefined;
    });

    it('prop set and read the correct value', function() {
        var user = new Model.User();
        user.name('test');
        expect(user.name()).to.equal('test');
    });

    it('with stream property', function() {
        var user = new Model.User();
        user.name('Foo');
        expect(user.name).to.have.property('stream');
        expect(user.name.stream.constructor).to.be.equal(md.stream);
    });

    it('have all properties that was set in `props` with values of type function', function() {
        var props = Model.User.modelOptions.props;
        var user = new Model.User();
        for (var i = 0; i < props.length; i++) {
            expect(user).to.have.property(props[i]).and.to.be.a('function');
        }
    });

    it('create instance with options', function() {
        var user = new Model.User({
            name: 'Foo'
        }, {
            test: 'test'
        });
        expect(user).to.be.instanceof(Model.User);
        expect(user.__options.test).to.be.equal('test');
    });

    it('return the default value set in schema if value of prop is `undefined` or `null`', function() {
        var ModelUserTest = md.model({
            name: 'ModelUserTest',
            props: ['test'],
            defaults: {
                test: 'Foo'
            }
        });
        var user = new ModelUserTest();
        expect(user.test()).to.be.equal('Foo');
        user.test(undefined);
        expect(user.test()).to.be.equal('Foo');
        user.test(null);
        expect(user.test()).to.be.equal('Foo');
    });

    it('finds the reference if value is string or number (only for enabled cache)', function() {

        var CacheSenderModel = md.model({
            name: 'CacheSenderModel',
            props: ['name', 'age']
        }, {
            cache: true
        });

        var CacheEmailModel = md.model({
            name: 'CacheEmailModel',
            props: ['subject', 'body', 'sender'],
            refs: {
                sender: 'CacheSenderModel'
            }
        }, {
            cache: true
        });

        var modelsSender = CacheSenderModel.createModels([{
            id: 123,
            name: 'Foo'
        }, {
            id: '456',
            name: 'Bar'
        }]);

        var modelsEmail = CacheEmailModel.createModels([{
            subject: 'Baz',
            sender: '456'
        }, {
            subject: 'Test',
            sender: 123
        }]);

        // Note that the `first email` is referencing the `second sender`. Check the ID!
        expect(modelsEmail[0].sender()).to.be.equal(modelsSender[1]);
        expect(modelsEmail[1].sender()).to.be.equal(modelsSender[0]);
        expect(modelsEmail[0].sender().name()).to.be.equal('Bar');
        expect(modelsEmail[1].sender().name()).to.be.equal('Foo');

    });

});

describe('Model.<properties>', function() {
    'use strict';

    it('`__lid` exist with value type of string', function() {
        var user = new Model.User();
        expect(user).to.have.property('__lid').and.to.be.a('string');
    });

    it('`__collections` exist with value type of array', function() {
        var user = new Model.User();
        expect(user).to.have.property('__collections').and.to.be.a('array');
    });

    it('`__options` exist with value type of object', function() {
        var user = new Model.User();
        expect(user).to.have.property('__options').and.to.be.a('object');
    });

    it('`__json` exist - *** the object representation of the model ***', function() {
        var user = new Model.User();
        expect(user).to.have.property('__json').and.to.be.a('object');
    });

    it('`__json` has `__model` property with value referencing to its model instance', function() {
        var user = new Model.User();
        expect(user.__json.__model).to.be.equal(user);
    });


    it('`__json` have all model properties (props)', function() {
        var props = Model.User.modelOptions.props;
        var user = new Model.User();
        for (var i = 0; i < props.length; i++) {
            expect(user.__json).to.have.property(props[i]);
        }
    });

    it('`__json` properties are equal to its model properties', function() {
        var props = Model.User.modelOptions.props;
        var user = new Model.User();
        user.profile(false);
        for (var i = 0; i < props.length; i++) {
            expect(user[props[i]]()).to.equal(user.__json[props[i]]);
        }
    });

    it('`__json` will update on change of prop', function() {
        var user = new Model.User();
        user.name('New Value');
        expect(user.__json.name).to.equal('New Value');
    });

    it('`__json` will update through `set()` or `setAll()`', function() {
        var user = new Model.User();
        user.set('name', 'foo');
        expect(user.__json.name).to.equal('foo');
        user.set({
            name: 'bar',
            profile: 'baz'
        });
        expect(user.__json.name).to.equal('bar');
        expect(user.__json.profile).to.equal('baz');
    });

});

describe('Model.<methods>', function() {
    'use strict';

    describe('#opt()', function() {
        'use strict';

        it('set options by plain object', function() {
            var user = new Model.User();
            user.opt({
                test: 'test'
            });
            expect(user.__options.test).to.be.equal('test');
        });

        it('set options by key/value`', function() {
            var user = new Model.User();
            user.opt('key', 'value');
            expect(user.__options.key).to.be.equal('value');
        });

        it('defaults to boolean true', function() {
            var user = new Model.User();
            user.opt('key');
            expect(user.__options.key).to.be.equal(true);
        });

        it('can set falsy except `undefined`', function() {
            var user = new Model.User();
            user.opt('key', false);
            expect(user.__options.key).to.be.false;
        });

    });

    describe('#lid()', function() {
        'use strict';

        it('returns a string with value of its `__lid`', function() {
            var user = new Model.User();
            expect(user.lid()).to.be.a('string').and.equal(user.__lid);
        });

    });

    describe('#url()', function() {
        'use strict';

        it('returns a string', function() {
            var user = new Model.User();
            expect(user.url()).to.be.a('string');
        });

    });

    describe('#attachCollection()', function() {
        'use strict';

        it('property `__collections` contains the collection', function() {
            var collection = new md.Collection();
            var user = new Model.User();

            user.attachCollection(collection);
            expect(user.__collections).to.contain(collection);
        });

        it('property `__collections` has correct size', function() {
            var collection = new md.Collection();
            var user = new Model.User();
            var size = user.__collections.length;

            user.attachCollection(collection);
            expect(user.__collections.length).to.be.equal(++size);

            user.attachCollection(collection);
            expect(user.__collections.length).to.be.equal(size);
        });

    });

    describe('#detachCollection()', function() {
        'use strict';

        it('property `__collections` does NOT contain the collection', function() {
            var collection = new md.Collection();
            var user = new Model.User();

            user.attachCollection(collection);
            expect(user.__collections).to.contain(collection);

            user.detachCollection(collection);
            expect(user.__collections).to.not.contain(collection);

        });

        it('property `__collections` has correct size', function() {
            var collection = new md.Collection();
            var user = new Model.User();

            user.attachCollection(collection);
            expect(user.__collections.length).to.be.equal(1);

            user.attachCollection(collection);
            expect(user.__collections.length).to.be.equal(1);

            user.detachCollection(collection);
            expect(user.__collections.length).to.be.equal(0);
        });

    });

    describe('#set()', function() {
        'use strict';

        it('set by object', function() {
            var note = new Model.Note();
            var user = new Model.User();
            note.set({
                title: 'Foo',
                body: 'Bar',
                author: user
            });
            expect(note.title()).to.equal('Foo');
            expect(note.body()).to.equal('Bar');
            expect(note.author()).to.equal(user);
        });

        it('set by object with child object (reference model)', function() {
            var note = new Model.Note();
            note.set({
                title: 'Foo',
                body: 'Bar',
                author: {
                    name: 'Test'
                }
            });
            expect(note.title()).to.equal('Foo');
            expect(note.body()).to.equal('Bar');
            expect(note.author()).to.instanceof(md.__TEST__.BaseModel);
            expect(note.author().name()).to.equal('Test');
        });

        it('set by object with parser', function() {
            var note = new Model.Note(null, {
                parse: true
            });
            note.set({
                wrap: {
                    title: 'Foo',
                    inner: {
                        body: 'Bar',
                        author: 'Authx'
                    }
                }
            });
            expect(note.title()).to.equal('Foo');
            expect(note.body()).to.equal('Bar');
            expect(note.author()).to.equal('Authx');
        });

        it('set by key & value', function() {
            var note = new Model.Note();
            var user = new Model.User();
            note.set('title', 'Foo');
            note.set('body', 'Bar');
            note.set('author', user);
            expect(note.title()).to.equal('Foo');
            expect(note.body()).to.equal('Bar');
            expect(note.author()).to.equal(user);
        });

        it('set to undefined if no value is set', function() {
            var user = new Model.User();
            user.set({
                name: 'Foo',
            });
            user.set('profile');
            expect(user.name()).to.equal('Foo');
            expect(user.profile()).to.be.undefined;
        });

        it('set falsy value like `false` and `0` ', function() {
            var user = new Model.User();
            user.set({
                name: 'Foo',
                age: 0
            });
            user.set('active', false);
            expect(user.name()).to.equal('Foo');
            expect(user.age()).to.equal(0);
            expect(user.active()).to.equal(false);
        });

        it('throw error if key is invalid', function() {
            var user = new Model.User();
            expect(function() {
                user.set('noprop', 'Foo');
            }).to.throw(Error);
        });

    });

    describe('#setObject()', function() {
        'use strict';

        it('successful set ', function() {
            var user = new Model.User();
            user.setObject({
                name: 'Foo',
                age: 32
            });
            expect(user.name()).to.equal('Foo');
            expect(user.age()).to.equal(32);
        });

        it('successful set with parser', function() {
            var note = new Model.Note(null, {
                parse: true
            });
            note.setObject({
                wrap: {
                    title: 'Foo',
                    inner: {
                        body: 'Bar',
                        author: 'Auth'
                    }
                }
            });
            expect(note.title()).to.equal('Foo');
            expect(note.body()).to.equal('Bar');
            expect(note.author()).to.equal('Auth');
        });

    });

    describe('#get()', function() {
        'use strict';

        it('return correct value', function() {
            var note = new Model.Note();
            var user = new Model.User();
            note.set({
                title: 'Foo',
                body: 'Bar',
                author: user
            });
            expect(note.get('title')).to.equal('Foo');
            expect(note.get('body')).to.equal('Bar');
            expect(note.get('author')).to.equal(user);
        });

        it('return a copy if NO key is specified (alias of .getCopy())', function() {
            var note = new Model.Note();
            var user = new Model.User();
            note.set({
                title: 'Foo',
                body: 'Bar',
                author: user
            });
            var copy = note.get();
            expect(copy).to.not.equal(note.getJson());
            expect(copy.title).to.equal('Foo');
            expect(copy.body).to.equal('Bar');
            expect(copy.author).to.eql(user.get());
        });

    });

    describe('#getJson()', function() {
        'use strict';

        it('return correct value', function() {
            var user = new Model.User();
            user.set({
                name: 'Foo',
                profile: 'Bar'
            });
            expect(user.getJson()).to.equal(user.__json);
            expect(user.getJson().name).to.equal('Foo');
            expect(user.getJson().profile).to.equal('Bar');
        });

    });

    describe('#getCopy()', function() {
        'use strict';

        it('really return a copy', function() {
            var user = new Model.User();
            user.set({
                name: 'Foo',
                profile: 'Bar'
            });
            var copy = user.getCopy();
            expect(copy).to.not.equal(user.getJson());
        });

        it('values are equal to the original', function() {
            var note = new Model.Note();
            var user = new Model.User();
            note.set({
                title: 'Foo',
                body: 'Bar',
                author: user
            });
            var copy = note.getCopy();
            expect(copy.title).to.equal(note.title());
            expect(copy.body).to.equal(note.body());
            expect(copy.author).to.eql(note.author().getCopy());
        });

        it('copy should not set the original or vice versa', function() {
            var note = new Model.Note();
            var user = new Model.User();
            note.set({
                title: 'Foo',
                body: 'Bar',
                author: user
            });
            var copy = note.getCopy();
            copy.title = 'Baz';
            expect(copy.title).to.not.equal(note.title());
            note.title('Test');
            expect(note.title()).to.not.equal(copy.title);
        });

        it('depopulate', function() {
            var note = new Model.Note();
            var user = new Model.User({
                id: 'id001'
            });
            note.set({
                title: 'Foo',
                body: 'Bar',
                author: user
            });
            // Default
            var copyA = note.getCopy();
            expect(copyA.author).to.be.object;
            // Depopulate
            var copyB = note.getCopy(false, true);
            expect(copyB.author).to.equal('id001');
        });

    });


    describe('#detach()', function() {
        'use strict';

        it('detached from all collections', function() {
            var user = new Model.User();
            var collA = new md.Collection();
            var collB = new md.Collection();
            collA.add(user);
            user.attachCollection(collB);
            expect(user.__collections).to.contain(collA);
            expect(user.__collections).to.contain(collB);
            var arr = user.__collections;
            user.detach();
            expect(arr.length).to.be.equal(0);
        });

    });

    describe('#dispose()', function() {
        'use strict';

        it('disposed', function() {
            var user = new Model.User();
            var keys = _.keys(user);
            user.dispose();
            for (var i = 0; i < keys.length; i++) {
                expect(user[keys[i]]).to.be.null;
            }
        });

    });

    describe('#remove()', function() {
        'use strict';

        it('detached from all collections', function() {
            var user = new Model.User();
            var collA = new md.Collection();
            var collB = new md.Collection();
            collA.add(user);
            user.attachCollection(collB);
            expect(user.__collections).to.contain(collA);
            expect(user.__collections).to.contain(collB);
            var arr = user.__collections;
            user.remove();
            expect(arr.length).to.be.equal(0);
        });

        it('disposed', function() {
            var user = new Model.User();
            var keys = _.keys(user);
            user.remove();
            for (var i = 0; i < keys.length; i++) {
                expect(user[keys[i]]).to.be.null;
            }
        });

    });

    describe('#save()', function() {
        'use strict';

        it('successful save (create)', function(done) {
            var user = new Model.User();
            user.name('Create');
            user.age(123);
            user.active(false);
            user.save().then(function(model) {
                try {
                    expect(model).to.be.equal(user);
                    expect(user.id().length).to.be.above(0);
                    expect(user.name()).to.equal('Create');
                    expect(user.profile()).to.be.undefined;
                    expect(user.age()).to.equal(123);
                    expect(user.active()).to.equal(false);
                    expect(user.isSaved()).to.equal(true);
                    done();
                } catch (e) {
                    done(e);
                }
            }, function(err) {
                done(err)
            });
        });

        it('successful save (update)', function(done) {
            var user = new Model.User();
            user.name('Update');
            user.age(123);
            user.active(false);
            user.save().then(function(model) {
                try {
                    expect(model).to.be.equal(user);
                    expect(user.id().length).to.be.above(0);
                    expect(user.name()).to.equal('Update');
                    expect(user.age()).to.equal(123);
                    user.name('Updated!');
                    user.age(456);
                    return user.save();
                } catch (e) {
                    done(e);
                }
            }, function(err) {
                done(err)
            }).then(function(model) {
                try {
                    expect(model).to.be.equal(user);
                    expect(user.id().length).to.be.above(0);
                    expect(user.name()).to.equal('Updated!');
                    expect(user.age()).to.equal(456);
                    expect(user.active()).to.equal(false);
                    expect(user.profile()).to.be.undefined;
                    done();
                } catch (e) {
                    done(e);
                }
            }, function(err) {
                done(err)
            });
        });

        it('save result through callback', function(done) {
            var user = new Model.User();
            user.name('Callback');
            user.save(function(err, response, model) {
                if (err) {
                    done(err);
                    return;
                }
                try {
                    expect(response.id.length).to.be.above(0);
                    expect(response.name).to.equal('Callback');
                    expect(model).to.be.equal(user);
                    expect(user.id().length).to.be.above(0);
                    expect(user.name()).to.equal('Callback');
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

    });

    describe('#fetch()', function() {
        'use strict';

        var user;

        before(function(done) {
            user = new Model.User();
            user.name('Hello');
            user.profile('World');
            user.save().then(function(model) {
                done()
            }, function(err) {
                done(err);
            })
        });

        it('successful fetch', function(done) {
            var existingUser = new Model.User();
            existingUser.id(user.id());
            existingUser.fetch().then(function(model) {
                // Fetch result : resolve.
                try {
                    expect(model.id()).to.be.equal(user.id());
                    expect(model.name()).to.equal('Hello');
                    expect(model.profile()).to.equal('World');
                    expect(model.isSaved()).to.equal(true);
                    expect(model.age()).to.be.undefined;
                    expect(model.active()).to.be.undefined;
                    done();
                } catch (e) {
                    done(e);
                }
            }, function(err) {
                // Fetch result : reject.
                done(err);
            });
        });

        it('fetch result through callback', function(done) {
            var existingUser = new Model.User();
            existingUser.id(user.id());
            existingUser.fetch(function(err, response, model) {
                if (err) {
                    done(err);
                    return;
                }
                try {
                    expect(response.id.length).to.be.above(0);
                    expect(response.name).to.equal('Hello');
                    expect(response.profile).to.equal('World');
                    expect(model.id()).to.be.equal(user.id());
                    expect(model.name()).to.equal('Hello');
                    expect(model.profile()).to.equal('World');
                    expect(model.isSaved()).to.equal(true);
                    expect(model.age()).to.be.undefined;
                    expect(model.active()).to.be.undefined;
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

        it('react to undefined result', function(done) {
            // Alarm model is configured to return `undefined` in `test-md.js`
            var undefAlarm = new Model.Alarm();
            undefAlarm.id('123');
            undefAlarm.fetch().then(function(mdl) {
                // Values are default values from model
                expect(mdl.title()).to.equal('Default Alarm Title');
                expect(mdl.time()).to.equal('8:00 AM');
                expect(mdl.isSaved()).to.be.false;
                done();
            });
        });

        it('falsy id (missing, string `undefined` and `null`', function(done) {
            var falsyIdAlarm = new Model.Alarm();
            // Fetching wihtout id should reject
            falsyIdAlarm.fetch()
                .then(function() { done('Must not fullfill'); })
                .catch(function(err) {
                    falsyIdAlarm.id('undefined');
                    // Fetching with string id `undefined` should reject
                    return falsyIdAlarm.fetch();
                })
                .then(function() { done('Must not fullfill'); })
                .catch(function(err) {
                    falsyIdAlarm.id('   null   ');
                    // Fetching with string id `null` should reject. Including space padd
                    return falsyIdAlarm.fetch();
                })
                .then(function() { done('Must not fullfill'); })
                .catch(function(err) {
                    done();
                });
        });

    });

    describe('#destroy()', function() {
        'use strict';

        it('successful destroy', function(done) {
            var user = new Model.User();
            user.name('Destroy');
            user.save().then(function(model) {
                // Save successful. Destroying now...
                return model.destroy();
            }, function(err) {
                done(err);
            }).then(function() {
                // Model `user` should be desposed after then block.
                setTimeout(function() {
                    try {
                        expect(user.__json).to.be.null;
                        expect(user.id).to.be.null;
                        done();
                    } catch (e) {
                        done(e);
                    }
                }, 0);
            }, function(err) {
                done(err)
            });
        });

        it('destroy result through callback', function(done) {
            var user = new Model.User();
            user.name('Destroy');
            user.save().then(function(model) {
                // Save successful. Destroying now...
                model.destroy(function(err) {
                    if (err) {
                        done(err);
                        return;
                    }
                    setTimeout(function() {
                        try {
                            expect(user.__json).to.be.null;
                            expect(user.id).to.be.null;
                            done();
                        } catch (e) {
                            done(e);
                        }
                    }, 0);
                });
            }, function(err) {
                done(err);
            });
        });

    });

    describe('#isSaved()', function() {
        'use strict';

        it('default to false', function() {
            var user = new Model.User();
            expect(user.isSaved()).to.be.false;
        });

        it('default to false even modified', function() {
            var user = new Model.User();
            user.name('Modified Foo');
            expect(user.isSaved()).to.be.false;
        });

        it('false even id is set', function() {
            var user = new Model.User({
                id: '001'
            });
            expect(user.isSaved()).to.be.false;
        });

        it('mark saved through save', function(done) {
            var user = new Model.User();
            user.name('IsSaved');
            if (user.isSaved())
                done('Model must not be saved yet.')
            user.save().then(function(model) {
                try {
                    expect(user.isSaved()).to.be.true;
                    done();
                } catch (e) {
                    done(e);
                }
            }, function(err) {
                done(err);
            });
        });

        it('mark saved through fetch', function(done) {
            var user = new Model.User();
            user.name('IsSaved');
            if (user.isSaved())
                done('Model must not be saved yet.')
            user.save().then(function(model) {
                try {
                    expect(user.isSaved()).to.be.true;
                    var existingUser = new Model.User();
                    existingUser.id(model.id());
                    expect(existingUser.isSaved()).to.be.false;
                    return existingUser.fetch();
                } catch (e) {
                    done(e);
                }
            }, function(err) {
                done(err);
            }).then(function(existingUser) {
                try {
                    expect(existingUser.isSaved()).to.be.true;
                    done();
                } catch (e) {
                    done(e);
                }
            }, function(err) {
                done(err);
            });
        });

    });

    describe('#isNew()', function() {
        'use strict';

        it('new if fresh instance', function(done) {
            try {
                var user = new Model.User();
                user.name('IsNew');
                expect(user.isNew()).to.be.true;
                user.id('notexist');
                expect(user.isNew()).to.be.true;
                done();
            } catch (e) {
                done(e);
            }
        });

        it('not new if saved', function(done) {
            var user = new Model.User();
            try {
                user.name('IsNew');
                expect(user.isNew()).to.be.true;
            } catch (e) {
                done(e);
            }
            user.save(function() {
                try {
                    expect(user.isNew()).to.be.false;
                    done();
                } catch (e) {
                    done(e);
                }
            }, function(err) {
                done(err);
            });
        });

    });

    describe('#isModified()', function() {
        'use strict';

        it('default to false', function() {
            var user = new Model.User();
            expect(user.isModified()).to.be.false;
        });

        it('true if a prop is changed', function() {
            var user = new Model.User();
            user.name('New Foo');
            expect(user.isModified()).to.be.true;
        });

    });

    describe('#isDirty()', function() {
        'use strict';

        it('true if modified', function() {
            var user = new Model.User();
            user.name('New Foo');
            expect(user.isDirty()).to.be.true;
        });

        it('true if not saved', function() {
            var user = new Model.User();
            expect(user.isDirty()).to.be.true;
        });

        it('false if saved and not modified', function(done) {
            var user = new Model.User();
            user.save(function() {
                try {
                    expect(user.isDirty()).to.be.false;
                    user.name('New Foo');
                    expect(user.isDirty()).to.be.true;
                    done();
                } catch (e) {
                    done(e);
                }
            }, function(err) {
                done(err);
            });
        });

    });

    describe('#populate()', function() {
        'use strict';

        it('successful populate', function(done) {
            var note = new Model.Note({
                folder: 'fold001',
                author: 'user001'
            });
            var populate = note.populate();
            populate.then(function(model) {
                expect(model).to.containSubset({
                    __json: {
                        folder: {
                            name: 'System'
                        }
                    }
                });
                expect(model).to.containSubset({
                    __json: {
                        author: {
                            name: 'UserFoo'
                        }
                    }
                });
                done();
            }).catch(function(err) {
                done(err);
            });
            expect(populate).to.be.fulfilled;
            expect(populate).to.eventually.deep.equal(note);
        });

    });

});