var bcrypt = require('bcrypt');

module.exports = function(schema, config) {

    // handle optional api
    var prop, steps;
    if (typeof config === "object") {
        prop = config.prop;
        steps = config.steps;
    } else if (typeof config === "string") {
        prop = config;
        steps = 12;
    }

    if (!prop) throw new Error('prop must be specified');
    
    // token virtual references
    var key = '_' + prop;
    var hash_prop = 'hash' + key;

    // extend the schema
    var extension = {};
    extension[hash_prop] = String;
    schema.add(extension);

    // setup access methods
    schema.virtual(prop)
        .set(function(value) {
            this[key] = value;
            // encrypt value
            // TODO: # of steps should be config driven
            var salt = bcrypt.genSaltSync(steps);
            this[hash_prop] = bcrypt.hashSync(value, salt);
        })
        .get(function() { return this[key]; });

    // abstract authentication function generator
    schema.methods['verify_' + prop] = function(value, cb) {
        if (!this[hash_prop]) return false;
        if (typeof cb !== "function") 
            return bcrypt.compareSync(value, this[hash_prop]);
        bcrypt.compare(value, this[hash_prop], cb);
    };

}