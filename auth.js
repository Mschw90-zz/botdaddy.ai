const express = require('express');
const router = express();
const User = require('./Models/User');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3000;
const { oauth2Client } = require('./node.js');
const { slack } = require('./src/index.js');


mongoose.connect(process.env.MONGODB_URI);

const scopes = [
  // 'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/calendar'
];

//needs to send /connect?slack_id=message.user
router.get('/connect', function(req, res) {
  let url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
    prompt: 'consent',
    // If you only need one scope you can pass it as a string
    scope: scopes,
    // Optional property that passes state parameters to redirect URI
    state: encodeURIComponent(JSON.stringify({
      // auth_id: req.query.auth_id,
      slack_id: req.query.slack_id
    })),
    redirect_uri: 'https://d437ba8c.ngrok.io/oauth'
  });
  res.redirect(url);
})

router.get('/oauth', function(req, res) {
  //save the code and then user information into database
  //if it doesn't exist, initiate oauth process
  //if it doesn't, ask the user to sign in again
  //req.query.code --> authorization code, allows you to obtain credentials
  oauth2Client.getToken(req.query.code, (err, tokens) => {
  // Now tokens contains an access_token and an optional refresh_token. Save them.
    if (!err) {
      let slack_id = JSON.parse(decodeURIComponent(req.query.state)).slack_id
      oauth2Client.setCredentials(tokens);
      const newUser = new User({
        slack_id: slack_id,
        tokens: tokens
      });
      newUser.save((err, result) => {
        if (err) {
          res.json({success: false, err: err})
        } else {
          res.json({success: true})
        }
      })
    }
  });
});

router.listen(PORT, error => {
    error
    ? console.error(error)
    : console.info(`🌎\nListening on port ${PORT}. Visit http://localhost:${PORT}/ in your browser.`);
});
