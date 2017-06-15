/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';
require('dotenv').config({
  silent: true
});
var express = require('express'); // app server
var bodyParser = require('body-parser'); // parser for post requests
var Watson = require('watson-developer-cloud/conversation/v1'); // watson sdk
const Context = require('./context');
const Output = require('./output');
const Input = require('./input');
const Cloudant = require('./cloudant');

const CaseCreate = require("./caseCreate");

// To hold transcription of conversation
var tbody = "<p align=\"center\">Chat Started: " + Date.now() + "</p><p align=\"center\">Chat Origin: Facebook</p><p align=\"center\">Agent Watson</p>"; 


var app = express();
// Bootstrap application settings
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.json());
// Create the service wrapper
var conversation = new Watson({
  // If unspecified here, the CONVERSATION_USERNAME and CONVERSATION_PASSWORD env properties will be checked
  // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
  // username: '<username>',
  // password: '<password>',
  url: 'https://gateway.watsonplatform.net/conversation/api',
  version_date: '2016-09-20',
  version: 'v1'
});
// Endpoint to be call from the client side
app.post('/api/message', function(req, res) {
  var workspace = process.env.WORKSPACE_ID || '<workspace-id>';
  if (!workspace || workspace === '<workspace-id>') {
    return res.json({
      'output': {
        'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable.'
      }
    });
  }
  var payload = {
    workspace_id: workspace,
    context: {},
    input: {}
  };
  if (req.body) {
    if (req.body.input) {
      payload.input = JSON.parse(Input.replaceTagsUserInput(JSON.stringify(
        req.body.input)));

    }
    if (req.body.context) {
      payload.context = Context.setContextToWatson(JSON.parse(JSON.stringify(
        req.body.context)), payload.input);
    }
  }

  if (payload.input) {
    tbody = tbody + " Customer: " + payload.input.text + "<br>";
    console.log("tbody is: " + tbody);
  }

  // Send the input to the conversation service
  conversation.message(payload, function(err, data) {
    Context.setContextAfterWatson(data);
    if (err) {
      return res.status(err.code || 500).json(err);
    }
    console.log(JSON.stringify(data));

    console.log(data.output.text);
    data.output.text = JSON.parse(Output.replaceTags(JSON.stringify(
      data.output.text)));
    //console.log(data.output.text);
    tbody = tbody + " Watson: " + data.output.text + "<br>";
  
    // before returning value, we check if the intent was to reach an agent

    if (data.intents && data.intents[0]) {
      var intent = data.intents[0];
      // We create a case if we are sure the customer wants to talk to an agent or if we do not understand what is going on
      // To do, forify this code to check all intents, right now checking only first! 
      if ((intent.confidence > 0.8 && intent.intent === "agent") || intent.confidence < 0.2) {
        console.log("Creating salesforce case with data" + JSON.stringify(data));
        console.log("Creating salesforce case with body" + tbody);
        
        CaseCreate.caseCreate(data, tbody);
      }
    }
    return res.json(Cloudant.updateMessage(payload, data));
  });
});
Cloudant.saveLastMessage();
//BOTS
var bots = require('./bots');
app.use('/', Cloudant.app);
app.use('/', bots);
module.exports = app;
