var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('Blogs', new Schema({
    blog: String,
    blogID: String
}));
