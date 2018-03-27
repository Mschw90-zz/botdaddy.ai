const { RTMClient, WebClient } = require('@slack/client');
const botToken = process.env.API_AI_TOKEN;
const token = process.env.SLACK_TOKEN;

//This code allows you to receive a message from the slackbot and respond to it. 

// The client is initialized and then started to get an active connection to the platform
const rtm = new RTMClient(token);
rtm.start();

rtm.on('message', (event) => {
  // For structure of `event`, see https://api.slack.com/events/reaction_added
  console.log(event);
  var message = event.text;


  // rtm.addOutgoingEvent(true, 'message', { text:'hi you', channel: event.channel, reply_broadcast: true }).then((res) => {
  //   // `res` contains information about the posted message
  //   console.log('Message sent: ', res.ts);
  // })
  // .catch(console.error);
});
