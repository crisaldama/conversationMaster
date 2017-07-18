// The Api module is designed to handle all interactions with the server

var Api = (function() {
  var requestPayload;
  var responsePayload;
  var messageEndpoint = '/api/message';

  // Publicly accessible methods defined
  return {
    sendRequest: sendRequest,

    // The request/response getters/setters are defined here to prevent internal methods
    // from calling the methods without any of the callbacks that are added elsewhere.
    getRequestPayload: function() {
      return requestPayload;
    },
    setRequestPayload: function(newPayloadStr) {
      requestPayload = JSON.parse(newPayloadStr);
    },
    getResponsePayload: function() {
      return responsePayload;
    },
    setResponsePayload: function(newPayloadStr) {
      responsePayload = JSON.parse(newPayloadStr);
      console.log("payload de vuelta:");
      console.log(newPayloadStr);

      console.log("solo el texto");
      console.log(responsePayload.output.text);
      speak(responsePayload.output.text);
      if (responsePayload.intents[0]){
        console.log(responsePayload.intents[0].intent);
        if(responsePayload.intents[0].intent==="Agent"){
          CallAgent=true;
          console.log("llamar a agente");
        }
      };
      if (responsePayload.context){
        console.log(responsePayload.context);
        if(responsePayload.context.switch){
          CallAgent=true;
          console.log("llamar a agentewatsonOrquestardo");
        }
      }
    }
  };

  // Send a message request to the server
  function sendRequest(text, context) {
    // Build request payload
    var payloadToWatson = {};
    if (text) {
      payloadToWatson.input = {
        text: text
      };
    }
    if (context) {
      /* you can alterate context from here before the request is sent.
      if(!context.nodesVisited)
        context.nodesVisited = {};
      if (!context.bubbleAmount)
        context.bubbleAmount = 0;
      context.bubbleAmount++;
      context.nbNodes = Object.keys(context.nodesVisited).length+1;*/
      payloadToWatson.context = context;
    }

    // Built http request
    var http = new XMLHttpRequest();
    http.open('POST', messageEndpoint, true);
    http.setRequestHeader('Content-type', 'application/json');
    http.onreadystatechange = function() {
      if (http.readyState === 4 && http.status === 200 && http.responseText) {
        Api.setResponsePayload(http.responseText);
        console.log("Respuesta http.responseText");
        console.log(http.responseText);
      }
    };

    var params = JSON.stringify(payloadToWatson);
    // Stored in variable (publicly visible through Api.getRequestPayload)
    // to be used throughout the application
    if (Object.getOwnPropertyNames(payloadToWatson).length !== 0) {
      Api.setRequestPayload(params);
    }

    // Send request
    http.send(params);
  }
}());
