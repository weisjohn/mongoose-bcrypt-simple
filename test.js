var assert = require('assert');
var mongoose = require('mongoose');
var async = require('async');
var mbs = require('./');

var user;

function models() {

    user = new mongoose.Schema({ username: String });
    user.plugin(mbs, 'password');
    user.plugin(mbs, { prop : 'pin', steps : 8 });
    user = mongoose.model('user', user);

}

function test() {

    // check api
    assert(typeof user.verify_password, "function");
    assert(typeof user.verify_pin, "function");

    // create documents
    async.waterfall([
        function(cb) {

            var user1 = new user({
                username : "foo",
                password : "bar",
                pin : "1234"
            });

            user1.save(function(err, doc) {
                assert.equal(err, null);

                assert(typeof doc.hash_password, "string");
                assert(typeof doc.hash_pin, "string");

                var json = doc.toJSON();
                assert.equal(json.password, null);
                assert.equal(json._password, null);
                assert.equal(json.pin, null);
                assert.equal(json._pin, null);

                cb(null, doc);
            });

        }, function(user1, cb) {

            // negative sync
            assert.equal(user1.verify_password("rab"), false);
            assert.equal(user1.verify_pin("4321"), false);

            // positive sync
            assert(user1.verify_password("bar"));
            assert(user1.verify_pin("1234"));

            cb(null, user1);

        }, function(user1, cb) {

            // negative sync
            user1.verify_password("rab", function(err, result) {
                assert.equal(result, false);
                cb(err, user1);
            });

        }, function(user1, cb) {

            // positive sync
            user1.verify_password("bar", function(err, result) {
                assert(result);
                cb(err, cb);
            });
        }

    ], function(err) {
        assert.equal(null, err);

        if (!/node-dev$/.test(process.env._)) {
            mongoose.disconnect();
            process.exit(0);
        }
    });


}

// connect and test
mongoose.connect('mongodb://localhost/mbs-test', function() {
    models();
    test();
});
