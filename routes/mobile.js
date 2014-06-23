exports.index = function(req, res){ 
	res.render('mobile/index', { title: 'Zzish' }); 
};

exports.prices = function(req, res){ 
	res.render('mobile/pricesmob', { title: 'Zzish' }); 
};

exports.modules = function(req, res){ 
	res.render('mobile/modulesmob', { title: 'Zzish' }); 
};

exports.module_select = function(req, res){ 
var module_select = req.params.module_select;

switch(module_select){
		case 'gamification':
			res.render('mobile/modules/gamification'); 
			break;
		case 'adaptivealgorithms':	
			res.render('mobile/modules/adaptivealgorithms'); 
			break;
		case 'backtoschool':	
			res.render('mobile/modules/backtoschool'); 
			break;
		case 'classroom':	
			res.render('mobile/modules/classroomready'); 
			break;
		case 'contentmodule':	
			res.render('mobile/modules/contentmodule'); 
			break;
		case 'learninganalytics':	
			res.render('mobile/modules/learninganalytics'); 
			break;
		case 'appanalytics':	
			res.render('mobile/modules/appanalytics'); 
			break;
	}
}

