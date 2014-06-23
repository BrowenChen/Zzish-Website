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
var mobile = require('./routes/mobile');

// all express uses
app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
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
app.get('/', checkForMobile, page.index);
app.get('/contactus', page.contactus);
app.get('/login', page.login);
//app.get('/PlatformiOSSDK.zip', page.downloadios);
//app.get('/PlatformAndroidSDK.zip', page.downloadandroid);
app.get('/register', page.register);
app.get('/modules', page.modules);
app.get('/faq', page.faq);
app.get('/prices', page.prices);
app.get('/aboutus', page.aboutus);
app.get('/privacypolicy', page.privacypolicy);
app.get('/api_docs', page.api_docs);
app.get('/modules/:module_select', page.module_select);
app.get('/students', page.comingsoon);
app.get('/parents', page.comingsoon);

app.post('/contactus', page.contactus_post);

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
app.post('/profile/dashboard/graph/:id', profile.getGraphDefinition);
app.post('/profile/dashboard/graph/:id/update', profile.updateGraphDefinition);
app.get('/profile/quickstart/:platform', needLogin, page.quickstart);
app.get('/profile/apps', needLogin, page.apps);
app.get('/profile/app/:id', needLogin, routes.app_info);
app.get('/profile/settings', profile.settings);
app.get('/logout', profile.logout);
app.post('/profile/create_app', needLogin, routes.create_app);
app.post('/profile/create_app_2', needLogin, routes.create_app_2);
app.post('/profile/update', needLogin, profile.update_profile);

//switching between accounts
app.get('/teachers/switch', routes.teacherswitch);
app.get('/profile/switch', routes.developerswitch);

//teachers
app.get('/teachers', teachers.index);
app.get('/teachers/register', authTeacher, teachers.register);
app.get('/teachers/dashboard', authTeacher, teachers.dashboard);
//app.get('/teachers/classroom/:id', authTeacher, teachers.classroom);
app.get('/teachers/classroom/:id', teachers.classroom);
app.get('/teachers/addclassroom', authTeacher, teachers.add_classroom);
app.get('/teachers/logout', teachers.logout)
app.post('/teachers/classroom/:classroom/addstudents', teachers.add_students);

app.post('/teachers/login', teachers.login)
app.post('/teachers/register', teachers.register_post);
app.post('/teachers/add_classroom_post', teachers.add_classroom_post);

app.get('/teachers/activate', teachers.activate);
app.post('/teachers/activate_post', teachers.activate_post);

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
 * ROUTING - Mobile
 * * * * * * * * * * * */

app.get('/mobile', mobile.index);
app.get('/mobile/prices', mobile.prices);
app.get('/mobile/modules', mobile.modules);
app.get('/mobile/modules/:module_select', mobile.module_select);

/* * * * * * * * * * * *
 * ROUTING - Game
 * * * * * * * * * * * */

app.get('/game', game.index);
app.get('/game/oeuahelwiuflawirEAIHEUWHLAHEFUIGWAFAEFWE', game.game);

//Create server to listen on 
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * 
 *                      ROUTING - Game
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
 
// returns true if the caller is a mobile phone (not tablet)
// compares the user agent of the caller against a regex
// This regex comes from http://detectmobilebrowsers.com/
function isCallerMobile(req) {
  var ua = req.headers['user-agent'].toLowerCase(),
    isMobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(ua) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0, 4));
 
  return !!isMobile;
}
 
// note: the next method param is passed as well
function checkForMobile(req, res, next) {
  // check to see if the caller is a mobile device
  var isMobile = isCallerMobile(req);
 
  if (isMobile) {
    console.log("Going mobile");
    res.redirect('/mobile');
  } else {
    // if we didn't detect mobile, call the next method, which will eventually call the desktop route
    return next();
  }
}
