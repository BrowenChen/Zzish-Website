
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create an export function to encapsulate the model creation
user.exports = function() {
  // define schema
  var UserSchema = new Schema({
    githubID : String,
    name : String,
    email: String
  });
  mongoose.model('Person', UserSchema);
};
