var config = require('../config/config');

var databaseUrl = config.databaseurl;
var collections = config.collections;

var db = require("mongojs").connect(databaseUrl, collections);
var ObjectId = require( 'mongodb' ).ObjectID;

var passwordHash = require('password-hash');
var Zzish = require('zzish/main.js');

z = new Zzish();
z.init();

// var z = new Zzish();
// z.init();

exports.index = function(req, res){ 

	res.render('teachers/main'); 
};

exports.register = function(req, res){ 
	res.render('teachers/register'); 
};

exports.add_classroom = function(req, res){ 
	res.render('teachers/add_classroom'); 
};

exports.logout = function(req, res){
	console.log('logging out');

    req.session.teacher_logged = false;
	req.session.username = "";
	res.redirect('/teachers'); 
};

exports.activate = function(req, res){
	res.render('web/activate'); 
};

exports.activate_post = function(req, res){
	//activate teacher mode and give relevent details in database
	var email = req.session.username;  

	db.user.update({'email' : email}, {$set: {'teacher' : true}});

	//turn on sessions n dat!
	req.session.teacher_logged = true;
	console.log(req.session.profileId);
	req.session.teacher_id = req.session.profileId;

	res.redirect('/teachers/dashboard');
};

exports.add_students = function(req, res){ 
	var classroomId = req.params.classroom;
	var code = req.body.code

	db.classrooms.update({_id: ObjectId(classroomId)}, {$push : {memberIds: code}}, function(err, classrooms) {
		
		if(classrooms != null){
			res.send(false);
		}
		else {
			res.send(true);
		}
	});

	console.log('class:' + classroomId + " code:" + code);
};

exports.dashboard = function(req, res){ 
	var userId = req.session.userId;
	console.log(userId);

	z.users.get(userId, function(err, r){
		console.log("get User returned", r);

		if(r.classrooms != null){
			res.render('teachers/dashboard', {name: r.name, classrooms : r.classrooms});
		}
		else {
			res.render('teachers/dashboard', {name: r.name, classrooms : []});
		}
	});

	// db.user.find({_id: ObjectId(teacher_id)}, function(err, teachers) {
	// 	console.log('teacher data' + JSON.stringify(teachers[0].name));

	// 	db.classrooms.find({owner: teacher_id}, function(err, classrooms) {
	// 		console.log("eafewf: " + classrooms);

	// 		if(classrooms != null){
	// 			res.render('teachers/dashboard', {name: teachers[0].name, classrooms : classrooms});
	// 		}
	// 		else {
	// 			res.render('teachers/dashboard', {name: teachers[0].name});
	// 		}
	// 	});		
	// });
	
};

exports.classroom = function(req, res){ 
	var id = req.params.id;
	console.log(id);


	// db.classrooms.find({_id: ObjectId(id)}, function(err, classrooms) {
		
	// 		if(classrooms != null){
	// 			res.render('teachers/classroom', {classrooms : classrooms[0]});
	// 		}
	// 		else {
	// 			res.render('teachers/classroom');
	// 		}
	// 	});


	res.render('teachers/classroom'); 


	// db.classrooms.find({code:classroomCode}, function(err, classroomdetails) {

	// 	console.log("eawefaewfewf" + classroomdetails[0]);

	// 	res.render('teachers/classroom', {classroom: classroomdetails[0]}); 
	// });
};

//POST REQUESTS

exports.login = function(req, res){ 
	console.log('Log In');

	var email = req.body.email;
	var password = req.body.password;

	console.log("email: " + email + " password: " + password);

	//password verification
	db.teachers.find({email: email}, function(err, teachers) {
		if(teachers.length == 0) {
			res.redirect('/teachers'); 
		}
		else{
			console.log(teachers);

			if(passwordHash.verify(password, teachers[0].teacherdetails.password)) { 
				console.log('passright');

				req.session.teacher_logged = true;
				req.session.teacher_id = teachers[0]._id;
				res.redirect('/teachers/dashboard');
			}
			else { 
				console.log('incorrect');
				req.session.teacher_logged = false;
				res.redirect('/teachers');
			}
		}
	});
};

exports.register_post = function(req, res){ 
	
	//collect form information
	console.log('register');

	var teacher = {
		email:req.body.email,
		name:req.body.name,
		tel:req.body.tel,
		password: passwordHash.generate(req.body.password)
	}

	//submit teacher to Database

	//check if email has already been logged to the system
	db.teachers.find({email: teacher.email}, function(err, teachers) {
		//teacher does not exist
		if(teachers.length == 0) {
			console.log('teacher did not exist before');

			db.teachers.save({classroom_id: [], email: teacher.email, teacherdetails: teacher}, function(err, saved) {
			  if( err || !saved ) {
			  	console.log("teacher email not saved"); 
			  }
			  else { 
			  	console.log("teacher email saved");
			  	console.log("teacher id: " + saved._id)
			  	//set user to logged on
				req.session.teacher_logged = true;
				req.session.teacher_id = saved._id;
				res.redirect('/teachers/dashboard')
			  }
			});
		} 
		else {
			console.log('user was already in system');
			res.redirect('/teachers');
		}
	});
};

exports.add_classroom_post = function(req, res){ 

	var teacher_id = req.session.teacher_id;

	console.log("teacherid: " + teacher_id);

	var code = Math.floor((Math.random() * 99999) + 1);
	var studentsArr = req.body.students.split(',');

	var classroom = {
		code : code,
		name : req.body.name,
		year: req.body.year,
		memberIds : studentsArr
	}



	// Add classroom to classroom database
	db.classrooms.save({owner: teacher_id, name: classroom.name, year: classroom.year, code: classroom.code, memberIds: classroom.memberIds}, function(err, saved) {
		if( err || !saved ) {
			console.log('fuckery');
			res.redirect('/teachers/dashboard');

		}
		else { 
			console.log("classroom saved");
			console.log(saved);
			db.teachers.update( {_id: ObjectId(teacher_id)}, {$push: {classroom_id: saved._id}} );
			res.redirect('/teachers/dashboard');
		}
	});
};

exports.add_students_post = function(req, res) {
	var classroom = req.params.classrooms_id;

	var student1 = req.body.student1;
	var student2 = req.body.student2;
	var student3 = req.body.student3;
	var student4 = req.body.student4;
	var student5 = req.body.student5;

	res.redirect('/teachers/' + classroom + 'addstudents'); 
};
