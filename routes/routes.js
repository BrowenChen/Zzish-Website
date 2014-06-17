var config = require('../config/config');

var databaseUrl = config.databaseurl;
var collections = config.collections;
var db = require("mongojs").connect(databaseUrl, collections);

exports.create_app = function(req, res){
	var os;
	var ios = req.body.ios;
	var android = req.body.android;
	var rest = req.body.rest;

	if(ios == 'true') os = 'ios';		
	else if(android == 'true') os = 'android';		
	else if(rest == 'true') os = 'rest';		



	var app = {
		author: req.session.username,
		name: req.body.appname,
		subject: req.body.subject,
		audience: req.body.audience,
 		learning_style: req.body.learning_style,
		os: os
	}

	console.log(app);

	db.app.find({name: app.name}, function(err, apps) {
		//user does not exist
		if(apps.length == 0) {
			console.log("app does not exist");
			db.app.save({name: app.name, author: app.author, details: app}, function(err, saved) {
			  if( err || !saved ) console.log("App did not get saved");
			  else console.log("App saved");

			  res.send(saved._id);
			});
		} else { 
			console.log('app name taken');
			res.send("0");
		}	

		

	})

	
};

exports.create_app_2 = function(req, res){
  console.log('received');
  var obj = {};
  console.log('body: ' + JSON.stringify(req.body));
  res.send(req.body);
};

exports.app_info = function(req, res){
	var _id = req.params.id;

	//get app info from database
	console.log('app id:' + _id);

	var app = {
		id: _id,
		name: 'TOBEGOTTENFROMDATABASE'
	}

	//display results
	res.render('profile/app_info', { app: app }); 
}

