var Home = require('../models/Home');
var secrets = require('../config/secrets');
var qs = require('qs');
var http = require('http');

/**
 * GET /
 * Home page.
 */

exports.index = function(req, res) {
  Home.find()
  .sort('-_id')
  .exec(function(err, thoughts){
    console.log("Total thoughts: " + thoughts.length);
    res.render('home', {
      title: 'Home',
      "thoughtList": thoughts
    });
  });
};

/**
 * POST /
 * Thought sent
 */
exports.postThought = function(req, res) {
  // check the thought sent
  //req.assert('txtThougth', 'An invalid thought was sent!').notEmpty();
  //console.log("The thought: " + req.body.txtThought);

  //capture the request errors, and return to page if any error if found
  var errors = req.validationErrors();
  if (errors){
    req.flash('errors', errors);
    return res.redirect('/');
  }

  // check the captcha result
  var challenge = req.body.recaptcha_challenge_field;
  var challenge_resp = req.body.recaptcha_response_field;
  var post_data = {"clientIP": (req.headers['X-Forwarded-For'] || req.connection.remoteAddress), "challenge": challenge, "response": challenge_resp};

  captchaResponse(post_data, function(resp){
    var ret = resp + ""; // force to convert in string
    ret = ret.split('\n'); // Line1: true or false, Line 2: response message
                          //https://developers.google.com/recaptcha/docs/verify
    if (ret[0].trim() == 'false') {
      req.flash('errors', {"msg": "Captcha Challenge unchallenged"});
      return res.redirect('/');
    }

    // prepare the thought to be stored
    var home = new Home({
      thinker: req.body.txtThinker || "anonymous",
      thought: req.body.txtThought,
      create_at: new Date()
    });

    home.save(function(err){
      if (err) return next(err);
        res.redirect('/');
    });

  }); //fim captcha
}

captchaResponse = function(challenge_data, callbackResponse) {
  var post_data = qs.stringify({"privatekey": secrets.captcha_priv, "remoteip": challenge_data.clientIP, "challenge":   challenge_data.challenge, "response": challenge_data.response});
  console.log("LOG::Post data: " + post_data);

  var options = {
    hostname:"www.google.com",
    port:"80",
    path:"/recaptcha/api/verify",
    method:"POST",
    headers:{"Content-Type":"application/x-www-form-urlencoded",
      "Content-Length": post_data.length}
  };

  var req = http.request(options, function(res){
    console.log("Status: " + res.statusCode);
    console.log("Headers " + JSON.stringify(res.headers));
    res.setEncoding('utf-8');
    res.on('data', function(chunk){
      var resp_data = chunk;
      console.log("Response return: " + resp_data);
      //return resp_data;
      callbackResponse(resp_data);
    });
  });

  req.on('error', function(err) {
    console.log("LOG::RequestError: " + err)
  });

  req.write(post_data + "\n");
  req.end();
}
