"use strict";

const { RTMClient, WebClient, RTM_EVENT } = require('@slack/client');
const botToken = process.env.API_AI_TOKEN;
const token = process.env.SLACK_BOT_TOKEN || '';
const apiai = require('apiai');
const app = apiai(botToken);
const rtm = new RTMClient(token);
const web = new WebClient(token);
const mongoose = require('mongoose');
const fs = require('fs');
const User = require('./Models/User');
const google = require('googleapis').google;
const calendar = google.calendar('v3');
const OAuth2 = google.auth.OAuth2;
var moment = require('moment');

const content = fs.readFileSync('client_secret.json');
const credentials = JSON.parse(content);
const oauth2Client = new OAuth2(
  credentials.web.client_id,
  credentials.web.client_secret,
  credentials.web.redirect_uris[0]
);

// mongoose.connect(process.env.MONGODB_URI);

//This code allows you to receive a message from the slackbot and respond to it.
// The client is initialized and then started to get an active connection to the platform
rtm.start();

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
  let message = event.text;
  conversation(message, event.user)
  .then((result) => {
    User.findOne({ slack_id: event.user }).then((user) => {
      if (user === null) {
        return rtm.addOutgoingEvent(true, 'message', { text:'Grant google access pls https://d437ba8c.ngrok.io/connect?slack_id=' + event.user, channel: event.channel, reply_broadcast: true }).then((res) => {
            // `res` contains information about the posted message
            console.log('Message sent: ', res.ts);
          })
          .catch(console.error);
      }
      oauth2Client.setCredentials(user.tokens);

      console.log(JSON.stringify(result, null, 2), 'result');

      const eventDetails = result.result.parameters;
      const meetingDetails = result.result.metadata;
      let summary;
      let startDate;
      let startTime;
      let endTime;
      let calEvent;
      if (eventDetails.task[0] === 'event') {
        summary = eventDetails.subject[0];
        startDate = eventDetails.date;
        calEvent = {
          'summary': summary,
          'start': {
            'date': startDate,
            'timeZone': 'America/Los_Angeles'
          }
        }
      }
      if (meetingDetails.intentName === 'meeting.add') {
        console.log('here');
        summary = 'Meeting with ' + eventDetails['given-name'].join(', ');
        startTime = eventDetails['date-time'][0];
        // let afterT = startTime.indexOf('T') + 1;
        // let endT = afterT + 5;
        // endTime = Number(eventDetails['date-time'][0].slice(afterT + 3, endT)) + 30;
        startTime = moment(startTime);
        endTime = startTime.add(30, 'm')
        console.log('endTime', endTime);
        console.log('summary', summary);
        console.log('starttime', startTime);
        calEvent = {
          'summary': summary,
          'start': {
            'dateTime': startTime.utc().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            'timeZone': 'America/Los_Angeles'
          },
          'end': {
            'dateTime': endTime.utc().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            'timeZone': 'America/Los_Angeles'
          }
        }
      }


      calendar.events.insert({
        auth: oauth2Client,
        calendarId: 'primary',
        resource: calEvent,
      }, (err, event) => {
        if (err) {
          console.log('There was an error contacting the Calendar service: ' + err);
          return;
        }
        console.log('Event created: %s', event.data.htmlLink);
      });
    })

      //bot receives the response, bot hits google cal api to make event

    // .then((user) => {
    //   console.log("USER", user);
    // })
    // .catch((err) => console.log('USER error', err))
    // console.log(JSON.stringify(result, null, 2), 'result');
    // console.log('DATA', result.result.parameters.date)
})
  .catch((err) => console.log('error', err))

});
      //if the user is authenticated, then obtain message
      //message should go to dialogflow to be parsed, dialogflow returns the response

      // const calEvent = {
      //   'summary': 'Google I/O 2015',
      //   'location': '800 Howard St., San Francisco, CA 94103',
      //   'description': 'A chance to hear more about Google\'s developer products.',
      //   'start': {
      //     'dateTime': '2015-05-28T09:00:00-07:00',
      //     'timeZone': 'America/Los_Angeles',
      //   },
      //   'end': {
      //     'dateTime': '2015-05-28T17:00:00-07:00',
      //     'timeZone': 'America/Los_Angeles',
      //   },
      //   'recurrence': [
      //     'RRULE:FREQ=DAILY;COUNT=2'
      //   ],
      //   'attendees': [
      //     {'email': 'lpage@example.com'},
      //     {'email': 'sbrin@example.com'},
      //   ],
      //   'reminders': {
      //     'useDefault': false,
      //     'overrides': [
      //       {'method': 'email', 'minutes': 24 * 60},
      //       {'method': 'popup', 'minutes': 10},
      //     ],
      //   },
      // };

//
// rtm.addOutgoingEvent(true, 'message', { text:'hi you', channel: event.channel, reply_broadcast: true }).then((res) => {
//     // `res` contains information about the posted message
//     console.log('Message sent: ', res.ts);
//   })
//   .catch(console.error);
// });

export { oauth2Client };
