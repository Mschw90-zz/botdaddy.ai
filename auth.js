var fs = require('fs');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var calendar = google.calendar('v3');
var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;

var content = fs.readFileSync('client_secret.json');
var credentials = JSON.parse(content);
var oauth2Client = new OAuth2(
  credentials.installed.client_id,
  credentials.installed.client_secret,
  credentials.installed.redirect_uris[0]
);

var scopes = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/calendar'
];

app.get('/connect', function(req, res) {
  var url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
    prompt: 'consent',
    // If you only need one scope you can pass it as a string
    scope: scopes,
    // Optional property that passes state parameters to redirect URI
    state: encodeURIComponent(JSON.stringify({
      auth_id: req.query.auth_id
    })),
    redirect_uri: 'http://localhost:3000/getToken'
  });
  res.redirect(url);
})

app.get('/getToken', function(req, res) {
  //save the code and then user information into database
  //if it doesn't exist, initiate oauth process
  //if it doesn't, ask the user to sign in again
  //req.query.code --> authorization code, allows you to obtain credentials
  oauth2Client.getToken(req.query.code, function (err, tokens) {
  // Now tokens contains an access_token and an optional refresh_token. Save them.
    console.log('token', tokens);
    if (!err) {
      oauth2Client.setCredentials(tokens);
    }
  });
});

app.listen(PORT, error => {
    error
    ? console.error(error)
    : console.info(`🌎\nListening on port ${PORT}. Visit http://localhost:${PORT}/ in your browser.`);
});
