exports.editusers = function(req, res){ 
	res.render('admin/edituser');
}; 

exports.enable = function(req, res){ 
	console.log('enabling user');
}; 

exports.disable = function(req, res){ 
	console.log('disabling user');
	res.redirect('/admin');
}; 

exports.enable = function(req, res){ 
	console.log('enabling user');
	res.redirect('/admin');
}; 

exports.delete = function(req, res){ 
	console.log('Deleting user');

	res.redirect('/admin');
}; 

exports.viewusers = function(req, res){ 
	id = req.params.id;

	res.render('admin/view');
}; 