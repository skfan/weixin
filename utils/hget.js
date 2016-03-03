var https = require('https');

var httpsGet = function (hostname, path, callback) {

	var options = {
		hostname: hostname,
		path: path
	};

	var req = https.request(options, function (res) {

		var bodyChunks = '';
		res.on('data', function (chunk) {
			bodyChunks += chunk;
		}).on('end', function () {
			callback(JSON.parse(bodyChunks));
		});
	});

	req.end();
	req.on('error', function (e) {
		console.log('ERROR: ' + e.message);
	});
};

module.exports = httpsGet;