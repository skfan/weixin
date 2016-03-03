var crypto = require("crypto");

var md5 = function (value) {
	var md5 = crypto.createHash('md5');
	md5.update(value);
	var str = md5.digest('hex');
	return str;
};
module.exports = md5;
