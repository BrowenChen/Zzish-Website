/* * * * * * * * * * * * * * * * * * * * * * * * * *
*	TODO
*
*	Change the way the password gets created, SHA encryption seems to not match when encrypted (dafuq O_o?)
*	Place token in config.js to automatically add it to data.
*
*	- Should the graph gettings and analytics functions be in user?
*	- new way of encrypting password, need to think about this.
*
* * * * * * * * * * * * * * * * * * * * * * * * * */

var config = require('../config/config');

var crypto = require('crypto');

var Zzish = require('zzish/main.js');
var databaseUrl = config.databaseurl;
var collections = config.collections;
var db = require("mongojs").connect(databaseUrl, collections);
var ObjectId = require( 'mongodb' ).ObjectID;

var appId = config.appId

var sdk = require('./sdk');
var url =  'http://dev.zzish.com/api';

var passwordHash = require('password-hash');

//POST TO REGISTER
exports.register = function(req, res){ 

	//Do something with received data
	var email_addy = req.body.email;
	console.log(email_addy);
	
	db.users.find({email: email_addy}, function(err, users) {
		//user does not exist
		if(users.length == 0) {
			console.log("user does not exist");
			db.users.save({email: email_addy}, function(err, saved) {
			  if( err || !saved ) console.log("Users email not saved");
			  else console.log("Users email saved");
			});

			res.render('register', { email: email_addy }); 
		} else { 
			console.log('user already exists');
			res.render('login'); 
		}	
	})
};



exports.register_submit = function(req, res){ 

	//Do something with received data
	var pass = crypto.createHash('md5').update(req.body.password).digest('hex');

	var user = {
		email:req.body.email,
		name:req.body.name,
		tel:req.body.tel,
		password:pass,

		business:req.body.business,
		appinstalls:req.body.appinstalls,
		nopeople:req.body.nopeople,

		adaptivealgorithms:req.body.adaptivealgorithms,
		backtoschool:req.body.backtoschool,
		classroom:req.body.classroom,
		contentmodule:req.body.contentmodule,
		gamification:req.body.gamification,
		learninganalytics:req.body.learninganalytics
	}

	console.log(user);

	//check if email has already been logged to the system
	db.users.find({email: user.email}, function(err, users) {
		//user does not exist
		if(users.length == 0) {
			console.log('user did not exist before');



			db.users.save({email: user.email, userdetails: user, name: user.name}, function(err, saved) {
			  if( err || !saved ) {
			  	console.log("Users email not saved"); 
			  }
			  else { 
			  	console.log("Users email saved");
			  }
			});
		} 
		else {
			console.log('user was already in system');

			db.users.update({email: user.email}, {$set: {userdetails: user}}, function(err, updated) {
			  if( err || !updated ) console.log("User not updated");
			  else console.log("User updated");
			});
		}
	});

	//set user to logged on
	req.session.logged = true;
	req.session.username = user.name;

	//redirect to home page
	res.redirect('/profile/home?reg=true');
};

exports.update_profile = function(req, res){
	console.log('received data');

	var userdetails = {
		name: req.body.name,
		tel: req.body.phone,
		email: req.body.email,
		business: req.body.business
	}

	db.users.update({name: req.session.username}, {$set: {name: name, email: email, userdetails: userdetails}}, function(err, updated) {
	  if( err || !updated ) console.log("User not updated");
	  else console.log("User updated");
	});

	req.session.username = name;

	res.redirect('/profile/');
};

exports.display = function(req, res){ 
	console.log("active username:" + req.session.username);


	db.users.find({name: req.session.username}, function(err, users) {
		if(users.length == 0) {
			console.log('err');
		}
		else{
			console.log(users[0].userdetails);

			res.render('profile/profile', { user: users[0].userdetails }); 
		}
	})
}; 

exports.forgotpassword = function(req, res){
	//generate rest link

	//send out reset link

	//place in database
}

exports.resetpassword = function(req, res){
	//get reset password link form user

	//validate

	//reset password page
}

exports.delete_app = function(req, res){
	//get app id
	var appid = req.params.id;

	console.log('appid' + appid);

	//remove from db
	db.app.remove({"_id": ObjectId(appid)}, function( err, record ) { 
		console.log('ewfawefewfawef');
	}); 
	//redirect back home
	res.redirect('/profile/apps');
}

exports.settings = function(req, res){ 
	res.render('profile/settings');
};

exports.login = function(req, res){ 



	//Initialise the zzish SDK
	var z = new Zzish();
	z.init();

	//place the z variable in session to be used later on
	req.session.z = z;

	var email = req.body.email;
	//var password = passwordHash.generate(req.body.password);
	var password = crypto.createHash('md5').update(req.body.password).digest('hex');

	//not using SDK
	//result = userAuth(z, email, password, function(result) {
	z.users.auth(email, password, function(result) {
		if(config.log) console.log('RESULT BITCH' + result);

		if(result.status == 0){
			console.log('passright');
			req.session.logged = true;
			req.session.username = 	result.username;
			req.session.token = result.authToken;
			res.redirect('/profile/home'); 		
		}
		else {
			req.session.logged = false;
			res.render('login', { message: result.message }); 
		}
	});
};

exports.logout = function(req, res){ 
	req.session.logged = false;
	req.session.username = "";
	res.redirect('/'); 

}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
*	
*														D A S H B O A R D  C O D E
*	
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

exports.dashboard = function(req, response){
	//SDK variabls
	// Should take Z from session -> var z = req.session.z;
	var z = new Zzish();
	z.init();

	var properties = []
	var charts = [];


	//get data about each graph
	var userId = '539ae5adda06dbf09875567f';

	z.users.getdashboard({userId: userId}, function(err, res) {
		//Do stuff with res, ie error handling

		var graph = res.result;


		//bar n line
		//var values =  { value: [[80, 20, 5], [80, 20, 5], [80, 20, 5]],  name: ['male', 'female', 'other'] };
		//var values =  { value: [[80, 20]],  name: ['male', 'female'] };
		//values =  { value: [[80]],  name: ['male'] };

		for (var i = 0; i < graph.length; i++) {
			var temp = {};

			//console.log(graph[i]);

			switch(graph[i].dataType){
			//switch('pie'){
				case "pie":
					console.log(graph[i].yvalues[0]);
					charts[i] = populatePieChart(graph[i].yvalues[0]);
					temp.type = 'pie';
					break;

				case "bar":
					//
					charts[i] = populateBarChart(graph[i].xvalues, graph[i].yvalues);
					temp.type = 'bar';
					break;

				case "line":
					//();
					charts[i] = populateLineChart(graph[i].xvalues, graph[i].yvalues);
					temp.type = 'line';
					break;
			}

			//Turning time from unix to real
			temp.start = timeConverter(graph[i].start);
			temp.end = timeConverter(graph[i].end);

			temp.side = i%2;
			temp.id = graph[i].id;
			temp.title = graph[i].topic + " : " + graph[i].xaxis + " vs " + graph[i].yaxis;
			properties.push(temp);
		}

		response.render('profile/dashboard', {charts: charts, properties:properties});

	});
};

//function to turn unix to normal time
function timeConverter(UNIX_timestamp){
 var a = new Date(UNIX_timestamp*1000);
 var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
     var year = a.getFullYear();
     var month = months[a.getMonth()];
     var date = a.getDate();
     var hour = a.getHours();
     var min = a.getMinutes();
     var sec = a.getSeconds();
     var time = date+', '+month+' '+ year + " - @" + hour + ":00" ;
     return time;
 }


//CHART GENERATION
function populatePieChart(values) {
	var colorStyle = ['#16A085', '#2ECC71', '#27AE60', '#3498DB', '#2980B9', '#9B59B6', '#8E44AD', '#34495E', '#2C3E50', '#2C3E50', '#F1C40F', '#F39C12', '#E67E22', '#D35400', '#E74C3C', '#C0392B'];
	colorIndex = Math.floor((Math.random() * colorStyle.length) + 1);		

	console.log('in populate chart' + values);

	var chart = [];
	for(var i = 0; i < values.length; i++){

		var randColor = colorStyle[colorIndex];

		var section = {
			value: values[i],
			color: randColor
		}

		colorIndex = (colorIndex+1)%colorStyle.length;

		chart.push(section);
	}

	return chart;
}


//Values input must be a two dimentional array
function populateBarChart(labels, values){
	var colorStyle = ['#16A085', '#2ECC71', '#27AE60', '#3498DB', '#2980B9', '#9B59B6', '#8E44AD', '#34495E', '#2C3E50', '#2C3E50', '#F1C40F', '#F39C12', '#E67E22', '#D35400', '#E74C3C', '#C0392B'];
	colorIndex = Math.floor((Math.random() * colorStyle.length) + 1);		

	var chart = {};


	chart.labels = labels;
	chart.datasets = [];

	for(var i = 0 ; i < values.length; i++){
		var randColor = colorStyle[colorIndex];

		var data = {
					
			fillColor : randColor,
			strokeColor : "rgba(220,220,220,1)",
			data: values[i]
		}


		chart.datasets.push(data);

		colorIndex = (colorIndex+1)%colorStyle.length;
	}

	return chart;
}

function populateLineChart(labels, values){
	var colorStyle = ['#16A085', '#2ECC71', '#27AE60', '#3498DB', '#2980B9', '#9B59B6', '#8E44AD', '#34495E', '#2C3E50', '#2C3E50', '#F1C40F', '#F39C12', '#E67E22', '#D35400', '#E74C3C', '#C0392B'];
	colorIndex = Math.floor((Math.random() * colorStyle.length) + 1);

	var chart = {};


	chart.labels = labels;
	chart.datasets = [];

	for(var i = 0 ; i < values.length; i++){
		var randColor = colorStyle[colorIndex];

		var data = {

					fillColor : randColor,
					strokeColor : "rgba(220,220,220,1)",
					pointColor : "rgba(220,220,220,1)",
					pointStrokeColor : "#fff",
					data: values[i]
					}

		chart.datasets.push(data);

		colorIndex = (colorIndex+1)%colorStyle.length;
	}

	return chart;
}

exports.getGraphDefinition = function(req, res) {

	var graphId = req.body.graphId;

	z.users.getgraph({userId: '539ae5adda06dbf09875567f', graphId: graphId}, function(err, res) {
		console.log(JSON.stringify(res));
	});	
}


