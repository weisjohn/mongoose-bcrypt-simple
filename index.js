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
    extension[hash_prop] = { type: String, csv: false };
    schema.add(extension);

    // setup access methods
    schema.virtual(prop, { csv : false })
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

    // hide these properties when calling toJSON
    if (!schema.options.toJSON) schema.options.toJSON = {};
    var fn = schema.options.toJSON.transform;
    schema.options.toJSON.transform = function (doc, ret, options) {
        // remove the hash_prop before returning the result
        delete ret[hash_prop];
        if (typeof fn === "function") fn(doc, ret, options);
    }

}