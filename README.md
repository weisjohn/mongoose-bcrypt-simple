# mongoose-bcrypt-simple

encrypt and verify mongoose schemas


### usage

```javascript
var mongoose = require('mongoose');
var mbs = require('mongoose-bcrypt-simple');

var user = new mongoose.Schema({ username: String });
user.plugin(mbs, 'password');
user.plugin(mbs, 'pin');
user = mongoose.model('user', user);
```

### virtuals

A virtual field is created for the property that automatically salts and hashes the value.

### verify

Verification methods are added based on the property name, prefixed with `verify_`, e.g. `verify_password` and `verify_pin`. If a callback is provided, the verification is async.

```
user.findOne({ email : 'test@example.net' }, function(err, user1) {

    user1.verify_password('foobar');         // sync
    user1.verify_pin('1234', cb);            // async

});
```

### schema

A path for the property is created on the schema prefixed with `hash_`, e.g. `hash_password` and `hash_pin`. You do not work with these properties directly.

### options

You can optionally specify the number of [salt steps](https://www.npmjs.com/package/bcrypt#api) to bcrypt:

```javascript
user.plugin(mbs, 'password', { steps : 12 });
```
