var config = require('../config/config');
var zzish = require('zzish/main.js');

var appId = config.appId;

var databaseUrl = config.databaseurl;
var collections = config.collections;

var ini = function() {
	var z = new zzish();
	z.init({appId:appId}, true);

	console.log('in ini');


}

var createdevice = function(z) {
	z.devices.create({name: 'node-device'}, function(err, res) {
		console.log('DEVICE ID: ' + res);

		return res.id;
	});	
}

var userPref = function(z, id) {
	if(config.log) { console.log('in user pref'); }

	var pref = [];

	//WHEN USING THE SDK
	//z.user.getpref(z,id);

	//Direct access
	return pref;
}

var getData = function(pref){
	if(config.log) { console.log('in populate charts'); }

	var info = []; 

	//loop through pref

	return info;
}

module.exports.ini = ini;
module.exports.userPref = userPref;
module.exports.getData = getData;