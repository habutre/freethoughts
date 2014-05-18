var mongoose = require('mongoose');

var ft = new mongoose.Schema({ //ft => freetoughts
  thinker: String,
  thought: String,
  create_at: Date
});

module.exports = mongoose.model('Home', ft);
