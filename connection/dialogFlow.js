// "use strict";
// const axios = require('axios');
// module.exports = {
//   interpretUserMessage(message, sessionId){
//     return axios.get('https://api.dialogflow.com/v1/query', {
//       params: {
//         v: '20170712',
//         query: message,
//         sessionId,
//         timezone: 'America/Los_Angeles',
//         lang: 'en'
//       },
//       headers:  {
//         Authorization: `Bearer ${process.env.API_AI_TOKEN}`
//       }
//     })
//   }
// }

// You can find your project ID in your Dialogflow agent settings
const projectId = 'botdaddy-ai'; //https://dialogflow.com/docs/agents#settings
const sessionId = 'quickstart-session-id'; //conversation id given by slack

const query = 'hello';
const languageCode = 'en-US';
 
// Instantiate a DialogFlow client.
const dialogflow = require('dialogflow');
const sessionClient = new dialogflow.SessionsClient();
 
// Define session path
const sessionPath = sessionClient.sessionPath(projectId, sessionId);
 
// The text query request.
const request = {
  session: sessionPath,
  queryInput: {
    text: {
      text: query,
      languageCode: languageCode,
    },
  },
};
 
// Send request and log result
sessionClient
  .detectIntent(request)
  .then(responses => {
    console.log('Detected intent');
    const result = responses[0].queryResult;
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);
    if (result.intent) {
      console.log(`  Intent: ${result.intent.displayName}`);
    } else {
      console.log(`  No intent matched.`);
    }
  })
  .catch(err => {
    console.error('ERROR:', err);
  });