var express = require('express');
var fs = require('fs');
var app = express();
var crypto = require("crypto");
var https = require('https');
var later = require('later');
var xml2js = require('xml2js');

var setting = require('../conf/setting');
var httpsGet = require('../utils/hget');
var md5 = require('../utils/md5');

var getCode = function () {
	var redirect_uri = setting.url+"createOrder";
	var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='+setting.appId+'&redirect_uri='+redirect_uri+'&response_type=code&scope=snsapi_base&state=123#wechat_redirect';
	return url;
};

var getOppenid = function (code, callback) {
	var hostName = setting.hostName;
	var path = '/sns/oauth2/access_token?appid='+setting.appId+'&secret='+setting.appSecret+'&code='+code+'&grant_type=authorization_code';
	/**
	 * data {access_token, opendid, expires, refresh_token, scope}
	 */
	httpsGet(hostName, path, function (data) {
		callback(data.openid);
	});
};

var createSign = function (openid, callback) {
	var appid = setting.appId;
	var mch_id = setting.mch_id;
	var nonce_str = setting.nonceStr;
	var body = '10 yuan for pear, 20 yuan for apple'; // 商品或者支付简单描述
	var out_trade_no = setting.timeStamp+'skfan'; // 商户系统内部的订单号，３２个字符内
	var total_free = '10'; // 订单金额
	var notify_url = setting.notify_url;
	var trade_type = setting.trade_type;
	var spbill_create_ip = setting.spbill_create_ip;

	var stringA = 'appid='+appid+'&body='+body+'&mch_id='+mch_id+
					'&nonce_str='+nonce_str+'&notify_url='+notify_url+
					'&openid='+openid+'&out_trade_no='+out_trade_no+
					'&spbill_create_ip='+spbill_create_ip+
					'&trade_type='+trade_type+'&total_free='+total_free;
	var stringSignTemp = stringA+'&key='+setting.keyWord;
	var sign = md5(stringSignTemp).toUpperCase();
	
	var jsonObj = {
		appid : setting.appId,
		mch_id : setting.mch_id,
		nonce_str : setting.nonceStr,
		body : '10 yuan for pear, 20 yuan for apple',
		out_trade_no : setting.timeStamp+'skfan',
		total_free : '10',
		notify_url : setting.notify_url,
		trade_type : setting.trade_type,
		openid : openid,
		sign : sign,
		spbill_create_ip : spbill_create_ip
	}

	var builder = new xml2js.Builder({rootName : 'xml'});
	var xmldata = builder.buildObject(jsonObj);

	console.log(xmldata);
	var options = {
		hostname: 'api.mch.weixin.qq.com',
		path: '/pay/unifiedorder',
		method: 'POST',
		headers: {
			"Content-Type" : "application/xml;charset=utf-8",
			"Content-Length" : xmldata.length
		}
	};

	var req = https.request(options, function (res) {

		var bodyChunks = '';
		res.on('data', function (chunk) {
			bodyChunks += chunk;
		}).on('end', function () {
			console.log("bodyChunks"+bodyChunks);
			callback(bodyChunks);
		});

	});

	req.on('error', function (e) {
		console.log('ERROR order : ' + e.message);
	});

	req.write(xmldata);
	req.end();
};

exports.getCode = getCode;
exports.getOppenid = getOppenid;
exports.createSign = createSign;