const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const { RTMClient, WebClient, RTM_EVENTS } = require('@slack/client');
const apiai = require('apiai');
const app = apiai(botToken);
const botToken = process.env.API_AI_TOKEN;
const token = process.env.SLACK_TOKEN;
const mongoose = require('mongoose');
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const bot = require('../node.js');
const User = require('../Models/User');

mongoose.connect(process.env.MONGODB_URI);


// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(require('cookie-parser')());
app.use(urlencodedParser);

// app.use('/', routes);
const rtm = new RTMClient(token);
const web = new WebClient(token);

rtm.start();


const conversation = (message, user) => {
  return new Promise((resolve, reject) => {
    // console.log('USER', user, message);
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
  // console.log(event);
  var message = event.text;
  conversation(message, event.user)
  .then((result) => {
    console.log("RESULT", result);
    // console.log("im here", event);
    User.findOne({ slack_id: event.user }).then((user) => {
      console.log("USER", user);
      if (user === null) {
        rtm.addOutgoingEvent(true, 'message', { text:'Grant google access pls https://be2ed6af.ngrok.io/connect?slack_id=' + event.user, channel: event.channel, reply_broadcast: true }).then((res) => {
            // `res` contains information about the posted message
            console.log('Message sent: ', res.ts);
          })
          .catch(console.error);
        // });
      }
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


app.post('/slack/actions', urlencodedParser, (req, res) =>{
    res.status(200).end() // best practice to respond with 200 status
    var actionJSONPayload = JSON.parse(req.body.payload) // parse URL-encoded payload JSON string
    var message = {
        "text": actionJSONPayload.user.name+" clicked: "+actionJSONPayload.actions[0].name,
        "replace_original": false
    }
    sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
})

app.post('/slack/slash-commands/send-me-buttons', urlencodedParser, (req, res) =>{
    res.status(200).end() // best practice to respond with empty 200 status code
    var reqBody = req.body
    var responseURL = reqBody.response_url
    if (reqBody.token != YOUR_APP_VERIFICATION_TOKEN){
        res.status(403).end("Access forbidden")
    }else{
        var message = {
            "text": "This is your first interactive message",
            "attachments": [
                {
                    "text": "Building buttons is easy right?",
                    "fallback": "Shame... buttons aren't supported in this land",
                    "callback_id": "button_tutorial",
                    "color": "#3AA3E3",
                    "attachment_type": "default",
                    "actions": [
                        {
                            "name": "yes",
                            "text": "yes",
                            "type": "button",
                            "value": "yes"
                        },
                        {
                            "name": "no",
                            "text": "no",
                            "type": "button",
                            "value": "no"
                        },
                        {
                            "name": "maybe",
                            "text": "maybe",
                            "type": "button",
                            "value": "maybe",
                            "style": "danger"
                        }
                    ]
                }
            ]
        }
        sendMessageToSlackResponseURL(responseURL, message)
    }
})

function sendMessageToSlackResponseURL(responseURL, JSONmessage){
    var postOptions = {
        uri: responseURL,
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        json: JSONmessage
    }
    request(postOptions, (error, response, body) => {
        if (error){
            // handle errors as you see fit
        }
    })
}


app.listen(PORT, error => {
    error
    ? console.error(error)
    : console.info(`🌎\nListening on port ${PORT}. Visit http://localhost:${PORT}/ in your browser.`);
});
