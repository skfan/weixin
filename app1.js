var express = require('express');
var fs = require('fs');
var app = express();
var crypto = require("crypto");
var https = require('https');
var later = require('later');

if (process.env.VCAP_SERVICES) {
  var env = JSON.parse(process.env.VCAP_SERVICES);
}

app.set('port', process.env.PORT || 80);
app.use(express.static(__dirname + '/public'));
app.use(require('body-parser')());

function sha1(str){
  var md5sum = crypto.createHash("sha1");
  md5sum.update(str);
  str = md5sum.digest("hex");
  return str;
}

function checkToken (req, res, callback) {
	var signature = req.query.signature;
	var timestamp = req.query.timestamp;
	var nonce = req.query.nonce;
	var echostr = req.query.echostr;
 	
 	var token = 'skfan';

 	var oriArr = new Array();
 	oriArr[0] = nonce;
 	oriArr[1] = timestamp;
 	oriArr[2] = token;
 	var original = oriArr.join('');
 	var scyptoString = sha1(original);
 	signature == scyptoString ? callback(echostr) : callback("false");
}


var appId = 'wx8799632d076d0a99';
var appSecret = 'd4624c36b6795d1d99dcf0547af5443d';
var keyWord = 'yahuiweixinpay20160302intelcd123';
var timeStamp = Date.parse(new Date());
var nonceStr = 'ibuaiVcKdpRxkhJA';
var url ='http://139.129.26.67/';

later.date.localTime();
var sched = later.parse.cron('0 */1 * * *');
var sched1 = later.parse.cron('0 */1 * * *');
later.setInterval(refreshAccessToken, sched);
later.setInterval(getJsApiTicket,sched1);

setTimeout(refreshAccessToken, 100);

function refreshAccessToken () {

	var options = {
		hostname: 'api.weixin.qq.com',
		path: '/cgi-bin/token?grant_type=client_credential&appid='+appId+'&secret='+appSecret
	};

	var req = https.request(options, function (res) {

		var bodyChunks = '';
		res.on('data', function (chunk) {
			bodyChunks += chunk;
		}).on('end', function () {

			var body = JSON.parse(bodyChunks);
			if (body.access_token) {
				var access_token = body.access_token;
				saveAccessToken(access_token);
			}else {
				console.dir(body);
			}
		});
	});

	req.end();
	req.on('error', function (e) {
		console.log('ERROR: ' + e.message);
	});
}

function saveAccessToken (accessToken) {
	fs.writeFile('accessToken.txt', accessToken, function (err) {
		if (err) throw err;
		setTimeout(getIp, 200);
		setTimeout(getJsApiTicket, 200);
		console.log('Access_token it\'s saved !'); 
	});
}

function getIp () {

	var access_token = fs.readFileSync('./accessToken.txt');
	var options = {
		hostname: 'api.weixin.qq.com',
		path: '/cgi-bin/getcallbackip?access_token=' + access_token
	};

	var req = https.request(options, function (res) {

		var bodyChunks = '';
		res.on('data', function (chunk) {
			bodyChunks += chunk;
		}).on('end', function () {

			var body = JSON.parse(bodyChunks);
			if (body.ip_list) {
				var ip_list = body.ip_list;
				saveIp(ip_list);
			}else {
				console.dir(body);
			}
		});
	});

	req.end();
	req.on('error', function (e) {
		console.log('ERROR: ' + e.message);
	});
}

function saveIp (ip_list) {
	fs.writeFile('weixinIp.txt', ip_list, function (err) {
		if (err) throw err;

		console.log('Ip it\'s saved !'); 
	});
}

function getJsApiTicket () {
	var access_token = fs.readFileSync('./accessToken.txt');
	var options = {
		hostname: 'api.weixin.qq.com',
		path: '/cgi-bin/ticket/getticket?access_token='+access_token+'&type=jsapi'
	};

	var req = https.request(options, function (res) {

		var bodyChunks = '';
		res.on('data', function (chunk) {
			bodyChunks += chunk;
		}).on('end', function () {

			var body = JSON.parse(bodyChunks);
			if (body.ticket) {
				var ticket = body.ticket;
				saveJsApiTicket(ticket);
			}else {
				console.dir(body);
			}
		});
	});

	req.end();
	req.on('error', function (e) {
		console.log('ERROR: ' + e.message);
	});
}

function saveJsApiTicket (ticket) {
	fs.writeFile('apiticket.txt', ticket, function (err) {
		if (err) throw err;

		console.log('Ticket it\'s saved !'); 
	});
}

function getSignature () {
	var string1 = 'jsapi_ticket='+data+'&noncestr='+nonceStr+'&timestamp='+timestamp+'&url='+url;
	var signature = sha1(string1);
	return signature;
}

function createorder () {
	var mch_id = '1230000109';
	var nonce_str = '5K8264ILTKCH16CQ2502SI8ZNMTM67VS';
	var body = 'pear 2';
	var out_trade_no = '20150806125346';
	var total_fee = '10';
	var spbill_create_ip = '139.129.26.67';
	var notify_url = 'http://139.129.26.67/notify';
	var trade_type = 'JSAPI';
	
	var str = 'appid='+appId+'&body='+body+'&mch_id='+mch_id+'&nonce_str='+nonce_str+'&notify_url='+notify_url+'&out_trade_no='+out_trade_no+'&spbill_create_ip='+spbill_create_ip+'&trade_type='+trade_type+'&total_fee';
	var stringSignTemp = str+"&key="+keyWord;
}	

function getcode () {
	var redirect_uri = 'http://139.129.26.67/getopenid';
	var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='+appId+'&redirect_uri='+redirect_uri+'&response_type=code&scope=snsapi_base&state=123#wechat_redirect';
	return url;
}
function getopenid (code) {
	console.log('code'+code);
	var options = {
		hostname: 'api.weixin.qq.com',
		path: '/sns/oauth2/access_token?appid='+appId+'&secret='+appSecret+'&code='+code+'&grant_type=authorization_code'
	};

	var req = https.request(options, function (res) {

		var bodyChunks = '';
		res.on('data', function (chunk) {
			bodyChunks += chunk;
		}).on('end', function () {

			var body = JSON.parse(bodyChunks);
			if (body.openid) {
				return body.openid;
			}else {
				console.dir(body);
			}
		});
	});

	req.end();
	req.on('error', function (e) {
		console.log('ERROR: ' + e.message);
	});
}
app.get('/', function (req, res) {
	fs.readFile('./public/index.html', function (err, data) {
		if (err) {
			res.type('text/plain');
			res.status(200);
			res.send('not Found index.html');
		}else {
			res.type('text/html');
			res.status(200);
			res.send(data);
		}
	});
});

app.get('/checktoken',function (req, res) {
	checkToken(req, res, function (data) {
		res.type('text/plain');
 	    res.status(200);
 	    res.send(data);
	});	
});
app.get('/gettoken', function (req, res) {
	fs.readFile('./accessToken.txt', function (err, data) {
		 
		if (err) {
			res.type('text/plain');
			res.status(200);
			res.send('no accessToken');
		}else {
			res.type('text/plain');
			res.status(200);
			res.send(data);
		}
		
	});
});
app.get('/getip', function (req, res) {
	fs.readFile('./weixinIp.txt', function (err, data) {
		console.log('xx');
		if (err) {
			res.type('text/plain');
			res.status(200);
			res.send('no accessToken');
		}else {
			res.type('text/plain');
			res.status(200);
			res.send(data);
		}
	});
});
app.get('/getapitiket', function (req, res) {
	fs.readFile('./apiticket.txt', function (err, data) {
		if (err) {
			res.type('text/plain');
			res.status(200);
			res.send('no ticket');
		}else {
			res.type('text/plain');
			res.status(200);
			res.send(data);
		}
	});
});
app.get('/getsignature',function (req, res) {
	res.type('text/plain');
	res.status(200);
	res.send(getSignature());
});
app.get('/getopenid', function (req, res) {
	res.type('text/plain');
	res.status(200);
	res.send(getopenid(req.query.code));
});
app.get('/createorder2', function (req, res) {
	var goods = req.query.goods;
	var price = req.query.price;
});
app.get('/getcode', function (req, res) {
	res.type('text/plain');
	res.status(200);
	res.redirect(getcode());
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
