var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AcademicDetails = require('AcademicDetails');
// set up a mongoose model
module.exports = mongoose.model('User', new Schema({
	student_first_name: String,
	student_middle_name: String,
  student_last_name: String,
	parent_first_name: String,
	parent_middle_name: String,
  parent_last_name: String,
	unique_id: String,
	account_type: String,
	permanent_address: String,
	temporary_address: String,
	dob: String,
	profile_image: String,
	student_mobile_no: String,
	parent_mobile_no: String,
	email: String,
	parent_email: String,
	password: String,
	token: String,
	academic_details: AcademicDetails,
	forgot_password: String
}));
