var config = require('./config/config');

/* * * * * * * * * * * *
 * Authentication Variables
 * * * * * * * * * * * */

var GITHUB_CLIENT_ID = config.github_client_id;
var GITHUB_CLIENT_SECRET = config.github_client_secret;

/* * * * * * * * * * * *
* Database Setup
* * * * * * * * * * * */

var databaseUrl = config.databaseurl;
var collections = config.collections;

 /* * * * * * * * * * * *
 * Module dependencies.
 * * * * * * * * * * * */
var express = require('express');
var page = require('./routes/pages');
var profile = require('./routes/profile')
var http = require('http');
var path = require('path');
var routes = require('./routes/routes');
var favicon = require('serve-favicon');
var auth = require('./routes/auth');
var passport = require('passport');
var util = require('util')
var GitHubStrategy = require('passport-github').Strategy;
var app = express();
var db = require("mongojs").connect(databaseUrl, collections);

var teachers = require('./routes/teachers');
var auth = require('./routes/auth');

var needLogin = auth.requiresLogin;
var authAdmin = auth.requiresAdmin;
var authTeacher = auth.requiresTeacher;

var zzish = require('./routes/zzish_test');
var admin = require('./routes/admin');
var game = require('./routes/game');
var sdk = require('./routes/sdk');

// all express uses
app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));
app.use(express.favicon(__dirname + '/public/img/favicon.ico'));

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());

app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));



// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}



/* * * * * * * * * * * *
 * Github Authentication
 * * * * * * * * * * * */
 
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://212.71.239.252:3000/auth/github/callback",
  },
function(accessToken, refreshToken, profile, done) {
  //console.log(profile);
  console.log('finished ');
  process.nextTick(function (){

    //check if user already exists
    db.users.find({githubId: profile.id}, function(err, users) {
      var userdetails = { name: profile.username };

      console.log("aefaewF" + userdetails.username);

      //add to database if doesnt
      if(users == null) {
          console.log("user does not exist");
          db.users.save({username: profile.username, githubId: profile.id, userdetails: userdetails}, function(err, saved) {
             if( err || !saved ) console.log("User not saved");
              else console.log("User saved");
          });
        }
      });
        
      return done(null, profile);
    });	
  }

)); 

/* * * * * * * * * * * *
 * ROUTING - website
 * * * * * * * * * * * */

app.get('/test/graph', zzish.graph);
app.get('/test/user', zzish.user);
app.get('/test/app', zzish.app);
app.get('/test/classroom', zzish.classroom);

//Basic Routes
app.get('/', page.index);
app.get('/login', page.login);
app.get('/register', page.register);
app.get('/modules', page.modules);
app.get('/faq', page.faq);
app.get('/prices', page.prices);
app.get('/aboutus', page.aboutus);
app.get('/privacypolicy', page.privacypolicy);
app.get('/api_docs', page.api_docs);
app.get('/modules/:module_select', page.module_select);

//Serve up html

//specifying the html directory as another public directory
var html_dir = './swag/';

app.use(express.static(path.join(__dirname, 'html')));

app.get('/doc/swag', function(req, res) {
  res.sendfile(html_dir + 'index.html');
});



//api pages
app.get('/api_docs/:platform', page.api_docs_platform);
app.get('/api_docs/:platform/:type', page.api_docs_type);

//general profile pages
app.get('/profile', profile.display);
app.get('/profile/home', needLogin, page.home);
app.get('/profile/dashboard', profile.dashboard);
app.get('/profile/quickstart/:platform', needLogin, page.quickstart);
app.get('/profile/apps', needLogin, page.apps);
app.get('/profile/app/:id', needLogin, routes.app_info);
app.get('/profile/settings', profile.settings);

app.get('/logout', profile.logout);
app.post('/profile/create_app', needLogin, routes.create_app);
app.post('/profile/create_app_2', needLogin, routes.create_app_2);
app.post('/profile/update', needLogin, profile.update_profile);



//teachers
app.get('/teachers', teachers.index);
app.get('/teachers/register', authTeacher, teachers.register);
app.get('/teachers/dashboard', authTeacher, teachers.dashboard);
app.get('/teachers/classroom/:id', authTeacher, teachers.classroom);
app.get('/teachers/addclassroom', authTeacher, teachers.add_classroom);
app.get('/teachers/logout', teachers.logout)
app.post('/teachers/classroom/:classroom/addstudents', teachers.add_students);


app.post('/teachers/login', teachers.login)
app.post('/teachers/register', teachers.register_post);
app.post('/teachers/add_classroom_post', teachers.add_classroom_post);

//admin
app.get('/admin', authAdmin, admin.editusers);
app.get('/admin/:id/delete',authAdmin, admin.delete);
app.get('/admin/:id/view', authAdmin, admin.viewusers);
app.get('/admin/:id/enable', authAdmin, admin.enable);
app.get('/admin/:id/disable', authAdmin, admin.disable);

//profile authentication
app.get('/auth/github', passport.authenticate('github',  { scope: 'email' }));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }),
		function(req, res) {
      console.log(req.user.username);
      req.session.username = req.user.username;
      //set session as logged on
      req.session.logged = true;
  		res.redirect('/profile/home');
});

//all post request
app.post('/register', profile.register);
app.post('/register_submit', profile.register_submit);
app.post('/login', profile.login);
app.get('/profile/app/delete/:id', profile.delete_app);

/* * * * * * * * * * * *
 * ROUTING - Game
 * * * * * * * * * * * */

app.get('/game', game.index);
app.get('/game/oeuahelwiuflawirEAIHEUWHLAHEFUIGWAFAEFWE', game.game);

//Create server to listen on 
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
