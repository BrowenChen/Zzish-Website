var config = {}

//Database config
config.databaseurl  = "mongodb://178.79.154.193:27017/platform";
config.collections = ["users", "app", "teachers", "classrooms"];

//Accounts
config.github_client_id = "50083b53f65c8540eeed";
config.github_client_secret = "1df39bcc12c1fef7c2e34c3681ea331ee0fed0fb";

config.appId = '53468afc30043a19979e0533';
config.token = '';

//Loggin on
config.log = true;

module.exports = config;