var express = require('express');
var https = require('https');
var later = require('later');
var fs = require('fs');
var sha1 = require('../utils/sha1');
var setting = require('../conf/setting');

var checkToken = function (req, res, callback) {

	var signature = req.query.signature;
	var timestamp = req.query.timestamp;
	var nonce = req.query.nonce;
	var echostr = req.query.echostr;

 	var oriArr = new Array();
 	oriArr[0] = nonce;
 	oriArr[1] = timestamp;
 	oriArr[2] = setting.token;

 	var original = oriArr.join('');
 	var scyptoString = sha1(original);
 	signature == scyptoString ? callback(echostr) : callback("false");
};

module.exports = checkToken;