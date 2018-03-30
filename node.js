"use strict";

const { RTMClient, WebClient, RTM_EVENTS } = require('@slack/client');
const botToken = process.env.API_AI_TOKEN;
const token = process.env.SLACK_BOT_TOKEN || '';
const apiai = require('apiai');
const app = apiai(botToken);
const rtm = new RTMClient(token);
const web = new WebClient(token);
const mongoose = require('mongoose');
var fs = require('fs');
const User = require('./Models/User');
const google = require('googleapis').google;
const calendar = google.calendar('v3');
var OAuth2 = google.auth.OAuth2;
require('./src/index.js')

// const OAuth2 = google.auth.OAuth2;
const googleCal = require('./auth.js');

var content = fs.readFileSync('client_secret.json');
var credentials = JSON.parse(content);
var oauth2Client = new OAuth2(
  credentials.web.client_id,
  credentials.web.client_secret,
  credentials.web.redirect_uris[0]
);

// mongoose.connect(process.env.MONGODB_URI);

//This code allows you to receive a message from the slackbot and respond to it.
// The client is initialized and then started to get an active connection to the platform
rtm.start();

const calEvent = {
  'summary': 'Google I/O 2015',
  'location': '800 Howard St., San Francisco, CA 94103',
  'description': 'A chance to hear more about Google\'s developer products.',
  'start': {
    'dateTime': '2015-05-28T09:00:00-07:00',
    'timeZone': 'America/Los_Angeles',
  },
  'end': {
    'dateTime': '2015-05-28T17:00:00-07:00',
    'timeZone': 'America/Los_Angeles',
  },
  'recurrence': [
    'RRULE:FREQ=DAILY;COUNT=2'
  ],
  'attendees': [
    {'email': 'lpage@example.com'},
    {'email': 'sbrin@example.com'},
  ],
  'reminders': {
    'useDefault': false,
    'overrides': [
      {'method': 'email', 'minutes': 24 * 60},
      {'method': 'popup', 'minutes': 10},
    ],
  },
};

const conversation = (message, user) => {
  return new Promise((resolve, reject) => {
    // console.log('USER', user, message);
    const request = app.textRequest(message, {
      sessionId: user
    });
    request.on('response', function(response) {
      resolve(response)
    });
    request.on('error', function(error) {
      reject(error)
    });
    request.end();
  });
}

rtm.on('message', (event) => {
  // For structure of `event`, see https://api.slack.com/events/reaction_added
  if (event.bot_id) {
    return;
  }
  var message = event.text;
  conversation(message, event.user)
  .then((result) => {
    User.findOne({ slack_id: event.user }).then((user) => {
      if (user === null) {
        rtm.addOutgoingEvent(true, 'message', { text:'Grant google access pls https://be2ed6af.ngrok.io/connect?slack_id=' + event.user, channel: event.channel, reply_broadcast: true }).then((res) => {
            // `res` contains information about the posted message
            console.log('Message sent: ', res.ts);
          })
          .catch(console.error);
      }
      //if the user is authenticated, then obtain message
      //message should go to dialogflow to be parsed, dialogflow returns the response
      console.log(JSON.stringify(result, null, 2), 'result');
      //bot receives the response, bot hits google cal api to make event

    oauth2Client.setCredentials(user.tokens);

    calendar.events.insert({
      auth: oauth2Client,
      calendarId: 'primary',
      resource: calEvent,
    }, function(err, event) {
      if (err) {
        console.log('There was an error contacting the Calendar service: ' + err);
        return;
      }
      console.log('Event created: %s', event.data.htmlLink);
    });
    })
    // .then((user) => {
    //   console.log("USER", user);
    // })
    // .catch((err) => console.log('USER error', err))
    // console.log(JSON.stringify(result, null, 2), 'result');
    // console.log('DATA', result.result.parameters.date)
  })
  .catch((err) => console.log('error', err))

});

//
// rtm.addOutgoingEvent(true, 'message', { text:'hi you', channel: event.channel, reply_broadcast: true }).then((res) => {
//     // `res` contains information about the posted message
//     console.log('Message sent: ', res.ts);
//   })
//   .catch(console.error);
// });

exports = oauth2Client;
