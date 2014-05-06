var User = require('../models/User');

/**
 * GET /
 * Home page.
 */

exports.index = function(req, res) {
  /// remove-me please
  User.find({}, function(err, users){
   req.users_ = users
  });
  res.render('home', {
    title: 'Home'
  });
};
