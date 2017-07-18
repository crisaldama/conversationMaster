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
var session = require('express-session');
var bodyParser = require('body-parser'); // parser for post requests
var Watson = require('watson-developer-cloud/conversation/v1'); // watson sdk
var request = require('request');

const Context = require('./context');
const Output = require('./output');
const Input = require('./input');
const Cloudant = require('./cloudant');

const CaseCreate = require("./caseCreate");

const CaseManagement = require("./caseManagement");

// To hold transcription of conversation
var tbody = "<p align=\"center\">Chat Started: " + Date.now() + "</p><p align=\"center\">Chat Origin: Facebook</p><p align=\"center\">Agent Watson</p>"; 
var openCase="";

var app = express();
// Bootstrap application settings
app.use(express.static('./public')); // load UI from public folder
// register the session with it's secret ID
app.use(session({secret: 'SFCD_Secret'}));
app.use(bodyParser.json());
// Create the service wrapper
var conversation = new Watson({
  // If unspecified here, the CONVERSATION_USERNAME and CONVERSATION_PASSWORD env properties will be checked
  // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
  // username: '<username>',
  // password: '<password>',
  url: 'https://gateway.watsonplatform.net/conversation/api',
  //url: 'https://utilitiesorquestador.eu-gb.mybluemix.net/api/messagepromise',
  version_date: '2016-09-20',
  version: 'v1'
});
// Endpoint to be call from the client side
app.post('/api/message', function(req, res) {
  req.session.phone="667170265";
  req.session.contactID="0030Y00000SRBchQAH";
  req.session.caseID="5000Y00000FL1EN";
  req.session.liveChatVisitor="5710Y000000Lj8jQAC";
  req.session.liveChatTranscript="5700Y000000LlzOQAS";

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
    var payloadBluemixOrquestador = {
      message: {},
    context: {}
  };
  if (req.body) {
    if (req.body.input) {
      payload.input = JSON.parse(Input.replaceTagsUserInput(JSON.stringify(
        req.body.input)));
      payloadBluemixOrquestador.message.text=payload.input.text;

    }
    if (req.body.context) {
      payload.context = Context.setContextToWatson(JSON.parse(JSON.stringify(
        req.body.context)), payload.input);
       // console.log(payload.context);
      payloadBluemixOrquestador.context=payload.context;  
    }
  }

  if (payload.input.text != "undefined") {
    tbody = tbody + " Customer: " + payload.input.text + "<br>";
    console.log("tbody is: " + tbody);
  }

  // Send the input to the conversation service
  //conversation.message(payload, function(err, data) {
    request({
    url: "https://utilitiesorquestador.eu-gb.mybluemix.net/api/messagepromise",
    method: "POST",
    json: true,   // <--Very important!!!
    body: payloadBluemixOrquestador
}, function (err, response, data){
    

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
    CaseManagement.insertTranscript(req.session.liveChatTranscript,tbody);
  
    // before returning value, we check if the intent was to reach an agent

    if (data.intents && data.intents[0]) {
      var intent = data.intents[0];
      // We create a case if we are sure the customer wants to talk to an agent or if we do not understand what is going on
      // To do, forify this code to check all intents, right now checking only first! 
      if ((intent.confidence > 0.8 && intent.intent === "agent") || intent.confidence < 0.2) {
        console.log("Creating salesforce case with data" + JSON.stringify(data));
        console.log("Creating salesforce case with body" + tbody);
        
        //CaseCreate.caseCreate(data, tbody);
      }
    }
    return res.json(Cloudant.updateMessage(payload, data));
  });
});


app.get('/api/init', function(req, res) {
  req.session.contactID="0030Y00000SRBchQAH";
  async function InitSes(){
        try {

            
            req.session.caseID = await CaseManagement.createCase(req.session.contactID);
            console.log("dentro async   "+req.session.caseID);
            req.session.liveChatVisitor = await CaseManagement.createLiveChatVisitor();
            console.log("dentro async   "+req.session.liveChatVisitor);
            req.session.liveChatTranscript = await CaseManagement.createLiveChatTranscript(req.session.liveChatVisitor,req.session.caseID);
            res.render('/public/index.html');
        } catch(error) {
            console.error(error);
        }
    }
    InitSes();

});

app.get('/chat/rest/System/SessionId', (req, res) => {

    request({
        url: "https://d.la4-c1-phx.salesforceliveagent.com/chat/rest/System/SessionId",
        method: "GET",
        json: true,   // <--Very important!!!
        headers: {
            //'X-LIVEAGENT-ENDPOINT' : liveagentEndpoint,
            'Content-Type':'application/json',
            'X-LIVEAGENT-API-VERSION' : req.header('X-LIVEAGENT-API-VERSION'),
            'Access-Control-Allow-Origin':'*',
            'Access-Control-Allow-Methods':'GET',
            'X-LIVEAGENT-AFFINITY' : null
        }
    },  function (err, response, data){
            //console.log(response);

            if (err) {
                return res.status(err.code || 500).json(err);
            }
            console.log(JSON.stringify(data));
            //res.writeHead(200);
            return res.status(200).json(data);
        }

    );
});
app.post('/chat/rest/Chasitor/ChasitorInit', (req, res) => {
    var preChatPanel = {
        label: "Einstein Chat",
        value: tbody,
        transcriptFields: [
                "Bot_Chat_Transcript__c"
        ],
        displayToAgent: true
    };
    req.body.prechatDetails.push(preChatPanel);

    console.log('body: ' + JSON.stringify(req.body));
    request({
        url: "https://d.la4-c1-phx.salesforceliveagent.com/chat/rest/Chasitor/ChasitorInit",
        method: "POST",
        json: true,   // <--Very important!!!
        headers: {
            //'X-LIVEAGENT-ENDPOINT' : liveagentEndpoint,
            'Content-Type':'application/json',
            'X-LIVEAGENT-API-VERSION' : req.header('X-LIVEAGENT-API-VERSION'),
            'X-LIVEAGENT-SESSION-KEY' : req.header('X-LIVEAGENT-SESSION-KEY'),
            'X-LIVEAGENT-SEQUENCE' : req.header('X-LIVEAGENT-SEQUENCE'),
            'X-LIVEAGENT-AFFINITY' : req.header('X-LIVEAGENT-AFFINITY')
        },
        
        body: req.body
    },  function (err, response, data){
            //console.log(response);

            if (err) {
                return res.status(err.code || 500).json(err);
            }
            console.log(JSON.stringify(data));
            //res.writeHead(200);
            return res.status(200).json(data);
        }

    );
});
Cloudant.saveLastMessage();
//BOTS
var bots = require('./bots');
app.use('/', Cloudant.app);
app.use('/', bots);
module.exports = app;
