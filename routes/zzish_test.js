var config = require('../config/config');

var databaseUrl = config.databaseurl;
var databaseUrlWrong = "mongodb://178.79.154.193:27017/platform	";
var collections = config.collections;
var db = require("mongojs").connect(databaseUrl, collections);
var dbw = require("mongojs").connect(databaseUrlWrong, collections);
var ObjectId = require( 'mongodb' ).ObjectID;
var crypto = require('crypto');

var Zzish = require('zzish/main.js');
var url =  'http://dev.zzish.com/api';


//Test new graph API calls
exports.graph = function(req, reponse){
	z = new Zzish();
	z.init();

	//Add graph and get it
	if(false){
		z.users.auth('111', crypto.createHash('md5').update('111').digest('hex'), function(result) {
			console.log('user IDs: ' + result.id);

			var data = {
				dataType: 'bar',
				xaxis: 'name',
				yaxis: 'amount',
				topic: 'purchases',
				start: '1325376000',
				end: '1402657194',
				userId: result.id
			}	

			z.users.creategraph(data, function(err, res) {
				//status 0 = success
				console.log('graph ID: ' + res.id);

				z.users.getgraph({userId: res.userId, graphId: res.id}, function(err, res) {
					console.log('oaiwefoaw');
					//console.log('graph content: ' + JSON.stringify(res.result));
				});	
			});	
		});
	}

	if(false){
		//get all graphs data for dashboard
		var userId = '539ae5adda06dbf09875567f';

		z.users.getdashboard({userId: userId}, function(err, res) {
			//console.log('getdata res: ' + JSON.stringify(res));
			console.log('getdata res: ' + JSON.stringify(res.reults));
		});
	}

	if(true){
		var data = {
			dataType: 'line',
			xaxis: 'name',
			yaxis: 'amount',
			topic: 'purchases',
			start: '1325376000',
			end: '1402657194',
			userId: '539ae5adda06dbf09875567f'
		}	

		z.users.creategraph(data, function(err, res) {
			console.log(res);
			reponse.render('web/test');
		});
	}
}

exports.script = function(req, res){
	dbw.users.find( function(err, user) {
		for (var i = 0; i < user.length; i++) {
   		 	db.users.save(user[i]);
		}
		
	});

	res.render('web/test');
};

exports.app = function(req, res){ 

	z = new Zzish();
	var runtime =  Date.now();

	function init(callback)	{

		z.init({appId:'53468afc30043a19979e0533', debug: true, baseUrl: url});

		z.devices.create({name: 'node-device'}, function(err, res) {
			console.log('DEVICE ID: ' + res.id);
			callback(res.id);
		});	
	}


	init(function(id) {


		z.apps.create({owner: {id: '5395ce780364a7992d2fcda7'}, name: 'The Greatest App in the world!!! ' + runtime}, function(err, res) {
			if (err) {
				console.log ("Error whilst creating App: code", err.status, "message:", err.message);
			} else {
				id = res.id;
				console.log("App res -> " + id);
				z.apps.get(id , function(err, res){
					console.log("res" + JSON.stringify(res));
				});
			}
		});
	});
	
	res.render('web/test'); 
};

exports.classroom = function(req, res){ 

	z = new Zzish();
	z.init();

	var runtime =  Date.now();

	z.classrooms.create({name: 'Classroom JS' + runtime}, function(err, res) {
		//id  = res.id;
		id = res.id;
		console.log("App res -> " + id);

		z.classrooms.get(id, function(err, res){
			console.log("resAIUEHFLIUHEKUFHEKLW" + JSON.stringify(res));
		});
	});

	res.render('web/test'); 
};


exports.user = function(req, res){ 

	z = new Zzish();
	z.init();
	var runtime =  Date.now();

	if(false){

		var data = {
			email: '111' + runtime,
			password: crypto.createHash('md5').update('111').digest('hex')
		}

		z.users.create(data, function(err, res) {
			id = res.id;
			console.log("created user id -> " + JSON.stringify(res));

			z.users.get(id, function(err, res){
				console.log("get User returned", res);
			});
		});

	}
	if(false){

		z.users.get('Dw5xS3EsZI04Fh7lQLVgSnf2', function(err, res){
				console.log("get User returned", res);
		});

	}

	if(true){

		z.users.update('Dw5xS3EsZI04Fh7lQLVgSnf2', function(err, res){
				console.log("get User returned", res);
		});

	}

	
	
	res.render('web/test'); 
};




