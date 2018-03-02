var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('User', new Schema({
	first_name: String,
	middle_name: String,
  last_name: String,
	unique_id: String,
	account_type: String,
	address: String,
	dob: String,
	profile_image: String,
	mobile_no: String,
	parent_no: String,
	email: String,
	password: String
}));
