// =================================================================
// get the packages we need ========================================
// =================================================================
var express 	= require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var nodemailer = require('nodemailer')

var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var User   = require('./app/models/user'); // get our mongoose model

// =================================================================
// configuration ===================================================
// =================================================================
var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

//Se nodemailer
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'akshitv01@gmail.com',
    pass: 'mathu1993gmail!!'
  }
});


// =================================================================
// routes ==========================================================
// =================================================================
app.get('/setup', function(req, res) {

	// create a sample user
	var nick = new User({
		name: 'Nick Cerminara',
		password: 'password',
		admin: true
	});
	nick.save(function(err) {
		if (err) throw err;

		console.log('User saved successfully');
		res.json({ success: true });
	});
});



// basic route (http://localhost:8080)
app.get('/', function(req, res) {
	res.send('Akshit: Server is up at https://onboard-api.herokuapp.com:' + port);
});

// ---------------------------------------------------------
// get an instance of the router for api routes
// ---------------------------------------------------------
var apiRoutes = express.Router();

// ---------------------------------------------------------
// authentication (no middleware necessary since this isnt authenticated)
// ---------------------------------------------------------
// http://localhost:8080/api/authenticate

//Signup API
app.post('/sign_up', function(req, res) {

	// create a sample user

//password
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var uniqueId = req.body.first_name + req.body.dob

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
//
	var newuser = new User({
		first_name: req.body.first_name,
		middle_name: req.body.middle_name,
		last_name: req.body.last_name,
		password: text,
		account_type: req.body.account_type,
		address: req.body.address,
		dob: req.body.dob,
		profile_image: req.body.profile_image,
		mobile_no: req.body.mobile_no,
		parent_no: req.body.parent_no,
		email: req.body.email,
    unique_id: uniqueId
	});


	if (req.body.email == undefined || req.body.dob == "" || req.body.dob == undefined){
		res.json({ success: false, message: 'Insufficient information was supplied.' });
	}
	else{

    User.findOne({
  		email: req.body.email
  	}, function(err, user) {

  		if (err) throw err;

  		if (user) {
  			res.json({ success: false, message: 'Email is already registered with us.' });
  		} else if (!user) {


	       newuser.save(function(err) {
		         if (err) throw err;


		           console.log('User saved successfully');
		             res.json({ success: true, message: 'Successfully Registered.'});
		              //
		                var mailOptions = {
  		                  from: 'akshitv01@gmail.com',
  		                  to: req.body.email,
  		                  subject: 'Successfully Registered! on SMS',
  		                  text: 'Hi! We are sharing your credentials via this mail. Username: ' + req.body.email + '  and Password: ' + text + ''
		                   };

		                     transporter.sendMail(mailOptions, function(error, info){
  	                        if (error)
                            {
    	                         console.log(error);
  	                        }
                            else
                            {
    	                         console.log('Email sent: ' + info.response);
  		                      }
		});
		//


});
}
});
}
});



apiRoutes.post('/authenticate', function(req, res) {

	// find the user
	User.findOne({
		email: req.body.email
	}, function(err, user) {

		if (err) throw err;

		if (!user) {
			res.json({ success: false, message: 'Authentication failed. User not found.' });
		} else if (user) {

			// check if password matches
			if (user.password != req.body.password) {
				res.json({ success: false, message: 'Authentication failed. Wrong password.' });
			} else {

				// if user is found and password is right
				// create a token
				var payload = {
					admin: user.account_type
				}
				var token = jwt.sign(payload, app.get('superSecret'), {
					expiresIn: 86400 // expires in 24 hours
				});

				res.json({
					success: true,
					message: 'Logged in Successfully!',
					token: token,
          data: user
				});
			}

		}

	});
});

// API for Forgot Password
apiRoutes.post('/forgot_password', function(req, res){
  var uniqueId = req.body.unique_id;

  User.findOne({
		unique_id: uniqueId
	}, function(err, user) {

	if (err) throw err;

  if (user){
  var userEmail = user.email
  var password = user.password
  var mailOptions = {
    from: 'akshitv01@gmail.com',
    to: userEmail,
    subject: 'Forgot Password! S-M-S',
    text: 'Hi! We are sharing your credentials via this mail. Username: ' + userEmail + '  and Password: ' + password + ''
  };

  transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
    }
  });

  res.json({
    success: true,
    message: 'Password has been sent to your registered email id.'
  });
}
else{
  res.json({
    success: false,
    message: 'This id is not registered with us.'
  });
}

});
});
//

// ---------------------------------------------------------
// route middleware to authenticate and check token
// ---------------------------------------------------------
apiRoutes.use(function(req, res, next) {

	// check header or url parameters or post parameters for token
	var token = req.body.token || req.param('token') || req.headers['x-access-token'];

	// decode token
	if (token) {

		// verifies secret and checks exp
		jwt.verify(token, app.get('superSecret'), function(err, decoded) {
			if (err) {
				return res.json({ success: false, message: 'Failed to authenticate token.' });
			} else {
				// if everything is good, save to request for use in other routes
				req.decoded = decoded;
				next();
			}
		});

	} else {

		// if there is no token
		// return an error
		return res.status(403).send({
			success: false,
			message: 'No token provided'
		});

	}

});

// ---------------------------------------------------------
// authenticated routes
// ---------------------------------------------------------
apiRoutes.get('/', function(req, res) {
	res.json({ message: 'Welcome to the coolest API on earth!' });
});

apiRoutes.get('/users', function(req, res) {
	User.find({}, function(err, users) {
		res.json(users);
	});
});

apiRoutes.get('/check', function(req, res) {
	res.json(req.decoded);
});

app.use('/api', apiRoutes);

// =================================================================
// start the server ================================================
// =================================================================
app.listen(port);
console.log('Server is up at http://localhost:' + port);
