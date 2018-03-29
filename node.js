"use strict";

const { RTMClient, WebClient, RTM_EVENTS } = require('@slack/client');
const botToken = process.env.API_AI_TOKEN;
const apiai = require('apiai');
const app = apiai(botToken);

//This code allows you to receive a message from the slackbot and respond to it.

// The client is initialized and then started to get an active connection to the platform
const token = process.env.SLACK_BOT_TOKEN || '';

const rtm = new RTMClient(token);
const web = new WebClient(token);
rtm.start();

const conversation = (message, user) => {
  return new Promise((resolve, reject) => {
    console.log('USER', user, message);
    var request = app.textRequest(message, {
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
  console.log(event);
  var message = event.text;
  conversation(message, event.user)
  .then((result) => {
    console.log(JSON.stringify(result, null, 2), 'result');
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
