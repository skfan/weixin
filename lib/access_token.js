var express = require('express');
var later = require('later');
var fs = require('fs');
var setting = require('../conf/setting');
var httpsGet = require('../utils/hget');

var saveAccessToken = function (access_token) {
	fs.writeFile('./storage/access_token.txt', access_token, function (err) {
		if (err) {
			throw err;
		}
		console.log('Access_token is saved!');
	});
};

var getAccessToken = function () {
	var hostName = setting.hostName;
	var path = '/cgi-bin/token?grant_type=client_credential&appid='+setting.appId+'&secret='+setting.appSecret;

	httpsGet(hostName, path, function (data) {
		if (data.access_token) {
			saveAccessToken(data.access_token);
		}else {
			console.dir("data.access_token : "+data);
		}
	});
};

var readAccessToken = function (callback) {
	fs.readFile('./storage/access_token.txt', function (err, data) {
		if (err) {
			throw err;
		}

		callback(data.toString());
	});
};

setTimeout(getAccessToken, 100);
var sched = later.parse.cron('0 */1 * * *');
later.setInterval(getAccessToken, sched);

exports.getAccessToken = getAccessToken;
exports.readAccessToken = readAccessToken;