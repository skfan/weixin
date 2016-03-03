var express = require('express');
var later = require('later');
var fs = require('fs');
var setting = require('../conf/setting');
var httpsGet = require('../utils/hget');

var jsapiTicket = require('./jsapi_ticket');
var sha1 = require('../utils/sha1');

var signature = function (callback) {
	jsapiTicket.readJsApiTicket(function (jsapi_ticket) {
		var string1 = 'jsapi_ticket='+jsapi_ticket+'&noncestr='+setting.nonceStr+'&timestamp='+setting.timeStamp+'&url='+setting.url;
		var signature = sha1(string1);
		callback(signature);
	});
};

module.exports = signature;