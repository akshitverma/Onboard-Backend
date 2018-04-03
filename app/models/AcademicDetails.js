var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('AcademicDetails', new Schema({
	college_name: String,
	course_name: String,
	subjects: String
}));
