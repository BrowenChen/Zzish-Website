var config = require('../config/config');

var databaseUrl = config.databaseurl;
var collections = config.collections;
var db = require("mongojs").connect(databaseUrl, collections);

exports.swag = function(req, res){ 
	res.render('swagger_index');
};

exports.index = function(req, res){ 
	res.render('index', { title: 'Zzish' }); 
};

exports.register = function(req, res){ 
	res.render('register', { email: 'youremail@zzish.com' }); 
};

exports.modules = function(req, res){ 
	res.render('modules', { email: 'youremail@zzish.com' }); 
};

exports.faq = function(req, res){ 
	res.render('faq', { email: 'youremail@zzish.com' }); 
};

exports.prices = function(req, res){ 
	res.render('prices', { email: 'youremail@zzish.com' }); 
};

exports.privacypolicy = function(req, res){ 
	res.render('privacypolicy', { email: 'youremail@zzish.com' }); 
};

exports.aboutus = function(req, res){ 
	res.render('aboutus', { email: 'youremail@zzish.com' }); 
};

exports.api_docs = function(req, res){ 
	res.render('docs', { email: 'youremail@zzish.com' }); 
};

//Routes for Modules

exports.module_select = function(req, res){ 
	var module_select = req.params.module_select;

	switch(module_select){
		case 'gamification':
			res.render('modules/gamification'); 
			break;
		case 'adaptivealgorithms':	
			res.render('modules/adaptivealgorithms'); 
			break;
		case 'backtoschool':	
			res.render('modules/backtoschool'); 
			break;
		case 'classroom':	
			res.render('modules/classroomready'); 
			break;
		case 'contentmodule':	
			res.render('modules/contentmodule'); 
			break;
		case 'learninganalytics':	
			res.render('modules/learninganalytics'); 
			break;
		case 'appanalytics':	
			res.render('modules/appanalytics'); 
			break;
	}
}
	


//routes for seperate API & docs
exports.api_docs_platform = function(req, res){
	//get path
 	var path = req.params.platform;

 	//format 
 	platform = path.charAt(0).toUpperCase() + path.slice(1);
 	console.log(platform);

 	//present
	res.render('platform', { platform: platform, path: path });
}

exports.api_docs_type = function(req, res){
	var platform_path = req.params.platform;
	var type_path = req.params.type;

	console.log(platform_path);
	console.log(type_path);

	platform = platform_path.charAt(0).toUpperCase() + platform_path.slice(1);
	type = type_path.charAt(0).toUpperCase() + type_path.slice(1);

	switch(platform_path){
		case 'android':
			if(type_path == 'guide') res.render('docs/androidguide', { platform: platform, type: type, platform_path: platform_path, type_path: type_path });
			else res.render('docs/androidapi', { platform: platform, type: 'API', platform_path: platform_path, type_path: type_path });
			break;
		case 'ios':
			if(type_path == 'guide') res.render('docs/iosguide', { platform: 'iOS', type: type, platform_path: platform_path, type_path: type_path });
			else res.render('docs/iosapi', { platform: 'iOS', type: 'API', platform_path: platform_path, type_path: type_path });
			break;
		case 'rest':
			if(type_path == 'guide') res.render('docs/restguide', { platform: 'REST', type: type, platform_path: platform_path, type_path: type_path });
			else res.render('docs/restapi', { platform: 'REST', type: 'API', platform_path: platform_path, type_path: type_path });
			break;
		case 'javascript':
			if(type_path == 'guide') res.render('docs/javascriptguide', { platform: 'Javascript', type: type, platform_path: platform_path, type_path: type_path });
			else res.render('docs/javascriptapi', { platform: 'Javascript', type: 'API', platform_path: platform_path, type_path: type_path });
			break;
	}
}

//Profile routes
exports.login = function(req, res){ 
	res.render('login', { title: 'Zzish' }); 
};

exports.home = function(req, res){ 
	var username = req.session.username;
	res.render('profile/home', { name: username }); 
};

exports.apps = function(req, res){
	var username = req.session.username;

	db.apps.find({author: username}, function(err, apps) {
		//user does not exist
		if(apps.length == 0) {
			console.log("No Apps Made");
			res.render('profile/apps', {apps: apps, name: username}); 
		} else { 
			console.log(apps); 
			res.render('profile/apps', {apps: apps, name:username}); 
		}	
	})
};

//app creation

exports.quickstart = function(req, res){ 
	var platform_path = req.params.platform;

	switch(platform_path){
		case 'android':
			res.render('profile/quickstart_android'); 
			break;
		case 'ios':
			res.render('profile/quickstart_ios'); 
			break;
		case 'rest':
			res.render('profile/quickstart_rest'); 
			break;
	}
	
};