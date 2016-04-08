var express = require('express');
var router = express.Router();
var redisUri = require('../settings.json').redisUri;
var redis = require('../modules/redis.js');

function reverse(s){
    return (s+ '').split("").reverse().join("");
}

function render(res, data, usedRedis) {
	res.render('index', { title: 'Express', data: data + (usedRedis ? " CACHED WITH REDIS!" : "") });
}

/* GET home page. */
router.get('/', function(req, res, next) {
	var url = req.url;
	if (!!redisUri) {
		redis.get(url, false).then(function(result) {
			var output, wasCached;
	        if (!result) {
	            redis.set(url, reverse(url));
	            output = reverse(url);
	        } else {
	        	wasCached = true;
	            output = result;
	        }
	        render(res, output, wasCached);
    	});
	} else {
		render(res, reverse(url));
	}
});

module.exports = router;
