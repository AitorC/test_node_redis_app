var redis = require('then-redis');
var redisUri = require('../settings.json').redisUri;
var _ = require('lodash');

function safeParse(val) {
    var result;
    try {
        result = JSON.parse(val);
    } catch(e) {
        console.error('Could\'nt parse Redis stored value' + val + '\n Error: ' + e);
        result = false;
    }
    return result;
}

module.exports.set = function(key, value) {
    if (_.isEmpty(value)) {
        console.error('Tried to store an empty value, Skipping for key: ' + key);
        return;
    }
    var redisDB = redis.createClient(redisUri);
    var expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 2);

    redisDB.set(key, JSON.stringify(value))
        .then(function(){
            redisDB.expireat(key, parseInt(expireDate.getTime() / 1000));
        })
        .then(function(){
            redisDB.quit();
        });

};

module.exports.get = function(key, defaultValue) {
    var redisDB = redis.createClient(redisUri);

    return redisDB.get(key).then(function(result) {
        var parsed = safeParse(result);
        redisDB.quit();
        if (!_.isEmpty(parsed)) {
            return parsed;
        } else {
            return defaultValue ? defaultValue : null;
        }
    });
};