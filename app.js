var express = require('express');
var fs = require('fs');
var app = express();
var crypto = require("crypto");
var https = require('https');
var later = require('later');

var token = require('./lib/token');
var signature = require('./lib/signature');
var order = require('./lib/order');

app.set('port', process.env.PORT || 80);
app.use(express.static(__dirname + '/public'));
app.use(require('body-parser')());

app.get('/',function () {
	fs.readFile('./public/index.html', function (err, data) {
		if (err) {
			throw err;
		}
		
		res.type('text/plain');
		res.status(200);
		res.send(data);
	});
});

// check token, first step
app.get('/token', function (req, res, next) {
	token(req, res, function (data) {
		res.type('text/plain');
		res.status(200);
		res.send(data);
	});
});

//获取JS_SDK开发所需要的signature
/**
 * 1. 获得access_token
 * 2. 通过access_token获得jsapi_ticket
 * 3. 使用jsapi_ticket生成signature
 */
app.get('/signature', function (req, res, next) {
	signature(function (signature) {
		res.type('text/plain');
		res.status(200);
		res.send(signature);
	});
});

//生成统一订单并返回prepay_id等
/**
 * 1. 获取openid
 * 2. 生成签名sign
 * 3. 给微信后台传递订单并获得prepay_id等返回值
 */
app.get('/getCode', function (req, res, next) {
	res.type('text/plain');
	res.status(200);
	res.redirect(order.getCode());
})
app.get('/createOrder', function (req, res, next) {

	order.getOppenid(req.query.code, function (oppenid) {

		order.createSign(oppenid, req.connection.remoteAddress,function (data) {
			res.type('text/xml');
			res.status(200);
			res.send(data);
		});
	});
});

app.get('/notify', function (req, res, next) {
	res.type('text/plain');
	res.status(200);
	res.send('This is notify!');
});
// 定制 404 和 500 页面
app.use(function (req, res, next) {
	res.type('text/plain');
	res.status('404');
	res.send('404 - Not Found');
});

app.use(function (err, req, res, next) {
	res.type('text/plain');
	res.status(500);
	res.send('500 - Server Error');
});

// 启动服务器
app.listen(app.get('port'),function () {
	console.log('server is started !');
});