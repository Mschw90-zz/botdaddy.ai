const mongoose = require('mongoose');

const User = mongoose.model('User', {
  slack_id: {
    type: String,
    required: true,
    unique: true
  },
  slack_name: {
    type: String,
  },
  google_profile: {
    type: String
  }
});

module.exports = User;
