exports.requiresLogin = function (req, res, next) {
  var auth = req.session.logged;
  if(!auth) {
  	console.log('i dont think ur suppose to be here');
  	return res.redirect('/login');
  }
  next();
};

exports.requiresAdmin = function (req, res, next) {
  console.log('check if has admin right');
  next();
};

exports.requiresTeacher = function (req, res, next) {
  console.log('check if has teachers right');

  var auth = req.session.teacher_logged;

  if(!auth) {
      console.log('i dont think ur suppose to be here');
      return res.redirect('/teachers');
    } else {
      console.log('auth is:' + auth);
    }

  next();
};