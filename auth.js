var fs = require('fs');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var calendar = google.calendar('v3');
var express = require('express');
var app = express();
var User = require('./Models/User');
var mongoose = require('mongoose');
var PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI);

var content = fs.readFileSync('client_secret.json');
var credentials = JSON.parse(content);
var oauth2Client = new OAuth2(
  credentials.web.client_id,
  credentials.web.client_secret,
  credentials.web.redirect_uris[0]
);

var scopes = [
  // 'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/calendar'
];

//needs to send /connect?slack_id=message.user
app.get('/connect', function(req, res) {
  var url = oauth2Client.generateAuthUrl({
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
    redirect_uri: 'https://be2ed6af.ngrok.io/oauth'
  });
  res.redirect(url);
})

app.get('/oauth', function(req, res) {
  //save the code and then user information into database
  //if it doesn't exist, initiate oauth process
  //if it doesn't, ask the user to sign in again
  //req.query.code --> authorization code, allows you to obtain credentials
  oauth2Client.getToken(req.query.code, function (err, tokens) {
  // Now tokens contains an access_token and an optional refresh_token. Save them.
    if (!err) {
      var slack_id = JSON.parse(decodeURIComponent(req.query.state)).slack_id
      oauth2Client.setCredentials(tokens);
      var newUser = new User({
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
