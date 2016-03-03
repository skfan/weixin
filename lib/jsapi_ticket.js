var express = require('express');
var later = require('later');
var fs = require('fs');
var setting = require('../conf/setting');
var httpsGet = require('../utils/hget');

var accessToken = require('./access_token');

var saveJsApiTicket = function (jsapi_ticket) {
	fs.writeFile('./storage/jsapi_ticket.txt', jsapi_ticket, function (err) {
		if (err) {
			throw err;
		}

		console.log('jsapi_ticket is saved!');
	});
};

var getJsApiTicket = function () {

	accessToken.readAccessToken(function (access_token) {
		var hostName = setting.hostName;
		var path = '/cgi-bin/ticket/getticket?access_token='+access_token+'&type=jsapi';
		
		httpsGet(hostName, path, function (data) {
			if (data.ticket) {
				saveJsApiTicket(data.ticket);
			}else {
				console.log('data.ticket : '+data.ticket);
			}
		});
	});
	
};

var readJsApiTicket = function (callback) {
	fs.readFile('./storage/jsapi_ticket.txt', function (err, data) {
		if (err) {
			throw err;
		}

		callback(data.toString());
	});
};

setTimeout(getJsApiTicket, 100);
var sched = later.parse.cron('0 */1 * * *');
later.setInterval(getJsApiTicket, sched);

exports.getJsApiTicket = getJsApiTicket;
exports.readJsApiTicket = readJsApiTicket;