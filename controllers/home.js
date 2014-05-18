var Home = require('../models/Home');
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

  // prepare the thought to be stored
  var home = new Home({
    thinker: 'anonymous',
    thought: req.body.txtThought,
    create_at: new Date()
  });

  home.save(function(err){
    if (err) return next(err);
    res.redirect('/');
  });
}
