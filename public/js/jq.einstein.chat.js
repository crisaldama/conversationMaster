var livAgentEndPoint="https://d.la4-c1-phx.salesforceliveagent.com/chat/rest/";
var liveagentSeq = 0;
var ackSeq = -1;
var chatPolling = false;
var sneakPeakPolling = false;
var pollInterval = 1000;
var chatVisibleTimeout = 5000;

var einstein_token = "";
var einstein_modelId = "";

var response_greeting = "Thank you for contacting us. Please let us know how can I help you today?"

var sessionId = "";
var sessionKey = "";
var affinityToken = "";
var clientPollTimeout = 0;
var csrfCookie = "";
var postChatUrl = "";

var chatLog = "";

var botResponseDataSet = {
  "Greetings" : [
    "Greetings!! how are you? May I assist you today?",
    "Hi!, how do you do. What I can do for you?",
    "Hello, please let me know what I can do for you?",
    "Aloha!, what can I do for you?"
  ],
  "Gratitudes" : [
    "<strong>Please let us know your experiences today. Thanks!!</strong><nav aria-label='Page navigation'><ul class='pagination'><li><a href='#'>Unsatisfied</a></li><li><a href='#'>1</a></li><li><a href='#'>2</a></li><li><a href='#'>3</a></li><li><a href='#'>4</a></li><li><a href='#'>5</a></li><li><a href='#'>6</a></li><li><a href='#'>7</a></li><li><a href='#'>8</a></li><li><a href='#'>9</a></li><li><a href='#'>Satisfied</a></li></ul></nav>"
  ],
  "Complaint" : [
    "Apologized for any inconvenience caused.<div class='list-group'><a href='#' class='list-group-item ei-chat-list'><h6 class='list-group-item-heading'><button class='btn btn-primary' onclick='startLiveAgentChatSession(); return false;' type='button'>Escalate issue</button></h6><p class='list-group-item-text' style='display: block;'><small>We will connect you with our customer care supervisor...</small></p></a></div>"
  ],
  "Confused" : [
    "Apologized for any inconvenience caused.<div class='list-group'><a href='#' class='list-group-item ei-chat-list'><h6 class='list-group-item-heading'><button class='btn btn-primary' onclick='startLiveAgentChatSession(); return false;' type='button'>Escalate issue</button></h6><p class='list-group-item-text' style='display: block;'><small>We will connect you with our customer care supervisor...</small></p></a></div>"
  ],
  "Shipping Info" : [
    "You have 1 shipment pending (order# 123124), expected arrival date is on 30-Jun-2017",
    "You have no shipment pending",
  ],
  "Billing" : [
    "You have 2 recent invoices: <br><div class='list-group'><a href='#' class='list-group-item ei-chat-list'><h6 class='list-group-item-heading'>Invoice# Jun-2017 <span class='label label-danger'>overdue</span></h6><p class='list-group-item-text' style='display: block;'><small>Invoice Amount: <strong>$73.32</strong></small></p></a><a href='#' class='list-group-item ei-chat-list'><h6 class='list-group-item-heading'>Invoice# Jul-2017 <span class='label label-warning'>due soon</span></h6><p class='list-group-item-text' style='display: block;'><small>Invoice Amount: <strong>$74.36</strong></small></p></a></div>Please select to see more details"
  ]
};

var liveagentEndpoint = "";

var preChatPanel = {
  label: "Einstein Chat",
  value: "Prueba Bot",
  transcriptFields: [
          "Bot_Chat_Transcript__c"
  ],
  displayToAgent: true
};

var preChatCaseSubject = {
  label: "Case Subject",
  value: "Inquiry about billing",
  transcriptFields: [
          "Subject"
  ],
  displayToAgent: true,
  doKnowledgeSearch: true
};
var preChatContactId = {
  label: "ContactId",
  value: "003f4000002MZYf",
  transcriptFields: [
          "ContactId"
  ],
  displayToAgent: true
};
var preChatCaseId = {
  label: "CaseId",
  value: "500f40000017yeC",
  transcriptFields: [
          "Id"
  ],
  displayToAgent: true
};

var preChatContactEmail = {
  label: "E-mail Address",
  value: "lboyle@example.com",
  transcriptFields: [
          "Email"
  ],
  displayToAgent: true
};
var preChatMobile = {
  label: "Mobile",
  value: "(415) 555-1212",
  transcriptFields: [
          "ContactMobile"
  ],
  displayToAgent: true
};

var initPayload = {
  organizationId: "00Df4000000lEXA",
  deploymentId: "572f4000000TVRz",
  buttonId: "573f4000000TUo2",
  sessionId: "",
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.95 Safari/537.36",
  language: "en-US",
  screenResolution: "2560x1440",
  visitorName: "Lauren Boyle",
  prechatDetails: [],
  prechatEntities: [
    {
      entityName: "Contact",
      linkToEntityName: "Case",
      linkToEntityField: "ContactId",
      saveToTranscript: "ContactId",
      entityFieldsMaps: [
        {
          fieldName: "Email",
          label: "E-mail Address",
          doFind: true,
          isExactMatch: true,
          doCreate: false
        }
      ]
    },
    {
      entityName: "Case",
      showOnCreate: true,
      saveToTranscript: "CaseId",
      entityFieldsMaps: [
        {
          fieldName: "Subject",
          label: "Case Subject",
          doFind: false,
          isExactMatch: false,
          doCreate: true
        },
        //{
        //  fieldName: "Id",
        //  label: "CaseId",
        //  doFind: true,
        //  isExactMatch: true,
        //  doCreate: false
        //},
        {
          fieldName: "Bot_Chat_Transcript__c",
          label: "Einstein Chat",
          doFind: false,
          isExactMatch: false,
          doCreate: true
        },
        {
          fieldName: "ContactId",
          label: "ContactId",
          doFind: false,
          isExactMatch: false,
          doCreate: false
        }
      ]
    }
  ],
  buttonOverrides: [],
  receiveQueueUpdates: true,
  isPost: true
};

function initChat() {
  console.log("initChat begin");
  liveagentSeq = liveagentSeq + 1;
  initPayload.sessionId = sessionId;
  preChatPanel.value = chatLog;
  initPayload.prechatDetails.push(preChatContactEmail);
  initPayload.prechatDetails.push(preChatCaseSubject);
  //initPayload.prechatDetails.push(preChatPanel);
  initPayload.prechatDetails.push(preChatMobile);
  //initPayload.prechatDetails.push(preChatContactId);
  //initPayload.prechatDetails.push(preChatCaseId);
  $.ajax({
    method: 'POST',
    url: '/chat/rest/Chasitor/ChasitorInit',
    headers: {
      'X-LIVEAGENT-ENDPOINT' : liveagentEndpoint,
      'X-LIVEAGENT-API-VERSION' : 40,
      'X-LIVEAGENT-AFFINITY' : affinityToken,
      'X-LIVEAGENT-SESSION-KEY': sessionKey,
      'X-LIVEAGENT-SEQUENCE': liveagentSeq,
      'Content-Type':'application/json',
      'X-CSRFToken': csrfCookie
    },
    dataType: "json",
    data: JSON.stringify(initPayload)
  }).done(function( retData, status, jqXhrObj ) {
    console.log("initChat ajax done : " + retData);
    if( jqXhrObj.status == "200" ) {
      chatPolling = true;
      pollChat();
    }
  }).always(function(response, status) {
    console.log("initChat ajax always : " + status);
  });
}

function startLiveAgentChatSession(){
  if(sessionId == "") {
    console.log("startChat clicked");
    $.ajax({
      method: 'GET',
      url: '/chat/rest/System/SessionId',
      headers: {
        //'X-LIVEAGENT-ENDPOINT' : liveagentEndpoint,
        'Content-Type':'application/json',
        'X-LIVEAGENT-API-VERSION' : 40,
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Methods':'GET',
        'X-LIVEAGENT-AFFINITY' : null
      },
      dataType: 'json'
    }).done(function( retData ) {
      console.log("getSession ajax done : " + retData);
      sessionId = retData.id;
      sessionKey = retData.key;
      affinityToken = retData.affinityToken;
      clientPollTimeout = retData.clientPollTimeout;
      $("#startOrEndChat").html("End Chat");
      initChat();
    });
  }
}

function createAlertDiv(alertType, message) {
  var theElement = '<div class="alert alert-' + alertType + ' alert-dismissible" role="alert">';
  theElement += '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>';
  theElement += message
  theElement += '</div>'
  return theElement
}

function tempAlertDiv(jqElem, alertType, message ) {
  $(jqElem).append(createAlertDiv(alertType, message));
  window.setTimeout( function() {
    $(jqElem).html("");
  }, 3000);
}

function createTypingChatElement(idTag, theMsg) {
  var chatElement = '<li class="left clearfix" id="' + idTag + '">';
  chatElement += '<div class="chat-body clearfix">';
  chatElement += '<p>';
  chatElement += theMsg;
  chatElement += '</p>';
  chatElement += '</div>';
  chatElement += '</li>';
  return chatElement;
}

function createLeftChatElement(timeStamp, name, chatMsg) {
  var chatElement = '<li class="left clearfix"><span class="chat-img pull-left">';
  chatElement += '<img src="/static/img/astro_small.png" alt="User Avatar" class="img-circle" /></span>';
  chatElement += '<div class="chat-body clearfix">';
  chatElement += '<div class="header">';
  chatElement += '<strong class="primary-font">' + name+ '</strong> <small class="pull-right text-muted">';
  chatElement += '<span class="glyphicon glyphicon-time"></span>' + timeStamp + '</small>';
  chatElement += '</div>';
  chatElement += '<p>';
  chatElement += chatMsg;
  chatElement += '</p>';
  chatElement += '</div>';
  chatElement += '</li>';
  chatLog += "[" + timeStamp + "] (" + name + ") " + chatMsg.replace(/<(?:.|\n)*?>/gm, '');
  return chatElement;
}

function createRightChatElement(timeStamp, name, chatMsg, idName) {
  var chatElement = '<li class="right clearfix"><span class="chat-img pull-right">';
  chatElement += '<img src="/static/img/question.jpg" alt="User Avatar" class="img-circle" /></span>';
  chatElement += '<div class="chat-body clearfix">';
  chatElement += '<div class="header">';
  chatElement += '<small class=" text-muted"><span id="' + idName + '" class="glyphicon glyphicon-transfer"></span><span class="glyphicon glyphicon-time"></span>' + timeStamp + '</small>';
  chatElement += '<strong class="pull-right primary-font">' + name+ '</strong>';
  chatElement += '</div>';
  chatElement += '<p>';
  chatElement += chatMsg;
  chatElement += '</p>';
  chatElement += '</div>';
  chatElement += '</li>';
  chatLog += "[" + timeStamp + "] (" + name + ") " + chatMsg.replace(/<(?:.|\n)*?>/gm, '');
  return chatElement;
}

function endAndResetChat() {
  var d1 = new Date();
  chatPolling = false;
  sneakPeakPolling = false;
  liveagentSeq = 0;
  ackSeq = -1;
  sessionId = "";
  sessionKey = "";
  affinityToken = "";
  clientPollTimeout = 0;
  $(".chat").append( createLeftChatElement(d1.toUTCString(), "Thank you", "Chat is ended " + postChatUrl));
  // $("#sendChatMessage").attr("disabled", "disabled");
  $("#startOrEndChat").html("Start Chat");
}

function pollChat() {
  // console.log("pollChat called");
  if( chatPolling ) {
    window.setTimeout( function() {
      var payload = {'ack': ackSeq};
      $.ajax({
        method: 'GET',
        url: '/chatapi/rest/System/Messages',
        headers: {
          'X-LIVEAGENT-ENDPOINT' : liveagentEndpoint,
          'X-LIVEAGENT-API-VERSION' : 40,
          'X-LIVEAGENT-AFFINITY' : affinityToken,
          'X-LIVEAGENT-SESSION-KEY': sessionKey,
          'X-CSRFToken': csrfCookie
        },
        dataType: 'json',
        data: payload
      }).done( function( retData, status, jqXhrObj ) {
        console.log("poll ajax done : " + JSON.stringify(retData));
        console.log("jqXhr status : " + jqXhrObj.status)
        if( jqXhrObj.status == "200") {
          ackSeq = retData.sequence;
          var d1 = new Date();
          // $("#chatData").val($("#chatData").val() + "[" + d1.toUTCString() + "]");
          console.log("Messeges size : " + retData.messages.length);
          for( var i = 0; i < retData.messages.length; i++ ) {
            var message = retData.messages[i];
            console.log("[" + i + "]" + message.type);
            if( message.type == "AgentTyping" || message.type == "AgentNotTyping" ) {
              console.log(message.type);
              if( $("#agentTyping").length <= 0 ) {
                $(".chat").append( createTypingChatElement("agentTyping", "Agent is typing...") );
                $(".panel-body").animate({ scrollTop: $('.panel-body').prop("scrollHeight")}, 1000);
              }
            }
            if( message.type == "AgentNotTyping" ) {
              $("#agentTyping").remove();
            }
            if( message.type == "ChatRequestSuccess") {
              $(".chat").append( createLeftChatElement(d1.toUTCString(), "Welcome", "Queue number is " + message.message.queuePosition));
              if( message.message.hasOwnProperty("postChatUrl") ) {
                postChatUrl = message.message.postChatUrl;
              }
            }
            if( message.type == "ChatRequestFail") {
              console.log(message.type + ":" + message.message.reason);
              var reason = message.message.reason;
              if( message.message.hasOwnProperty("postChatUrl") ) {
                postChatUrl = message.message.postChatUrl;
              }
              $(".chat").append( createLeftChatElement(d1.toUTCString(), "Astro", "Sorry, we're unavailable at the moment"));
              $(".panel-body").animate({ scrollTop: $('.panel-body').prop("scrollHeight")}, 1000);
              endAndResetChat();
            }
            if( message.type == "ChatEstablished" ) {
              console.log(message.type + ":" + message.message.sneakPeekEnabled);
              // $("#sendChatMessage").removeAttr("disabled");
              if( message.message.sneakPeekEnabled ) {
                sneakPeakPolling = true;
                pollSneakPeak();
              }
            }
            if( message.type == "ChatEnded" || message.type == "AgentDisconnect" ) {
              console.log(message.type);
              endAndResetChat();
            }
            if( message.type == "QueueUpdate" ) {
              console.log(message.type);
              $(".chat").append( createLeftChatElement(d1.toUTCString(), "Hi", "Queue number is " + message.message.queuePosition));
              $(".panel-body").animate({ scrollTop: $('.panel-body').prop("scrollHeight")}, 1000);
            }
            if( message.type == "ChatMessage" ) {
              $("#agentTyping").remove();
              $(".chat").append( createLeftChatElement(d1.toUTCString(), message.message.name, message.message.text));
              $(".panel-body").animate({ scrollTop: $('.panel-body').prop("scrollHeight")}, 1000);
            }
          }
        }
      }).always( function(retData, status ) {
        console.log("pollChat always : " + status);
        pollChat();
      });
    }, pollInterval);
  }
}

function pollSneakPeak() {
  if( sneakPeakPolling ) {
    window.setTimeout( function() {
      console.log("pollSneakPeak start");
      var chatMessage = $("#sendChatMessage").val();
      var msgLen = chatMessage.length;
      if( msgLen > 0 ) {
        console.log("sneak peak lenght : " + msgLen);
        var payload = {position: 0, text: chatMessage};
        liveagentSeq = liveagentSeq + 1;
        $.ajax({
          method: 'POST',
          url: '/chatapi/rest/Chasitor/ChasitorSneakPeek',
          headers: {
            'X-LIVEAGENT-ENDPOINT' : liveagentEndpoint,
            'X-LIVEAGENT-API-VERSION' : 40,
            'X-LIVEAGENT-AFFINITY' : affinityToken,
            'X-LIVEAGENT-SESSION-KEY': sessionKey,
            'X-LIVEAGENT-SEQUENCE': liveagentSeq,
            'X-CSRFToken': csrfCookie
          },
          dataType: "text",
          data: JSON.stringify(payload)
        }).done(function( retData ) {
          console.log("pollSneakPeak ajax done : " + retData);
        }).always(function(retData, status){
          console.log("pollSneakPeak ajax always : " + status);
          pollSneakPeak();
        });
      } else {
        pollSneakPeak();
      }
    }, pollInterval);
  }
}

function getBotResponseObject(intentLabel) {
  console.log('getBotResponseObject start');
  var botResponse = "I'm not sure what do you mean?";
  if( botResponseDataSet.hasOwnProperty(intentLabel) ) {
    responseList = botResponseDataSet[intentLabel];
    var responseNum = responseList.length;
    var randomResponse = Math.floor(Math.random() * responseNum);
    botResponse = responseList[randomResponse];
  }
  console.log('getBotResponseObject return : ' + botResponse)
  return botResponse;
}

function chatWithEinsteinIntent(message, idTag) {
  console.log("chatWithEinsteinIntent begin");
  var mmToken = einstein_token;
  var modelId = einstein_modelId;
  var d1 = new Date();
  $("#testModelId").val(modelId);
  console.log("MM Token : " + mmToken + ", Model ID : " + modelId + ", Message : " + message);
  var fd = new FormData();
  fd.set('modelId', modelId);
  fd.set('document', message);
  console.log("Payload : " + fd);
  $.ajax({
    method: 'POST',
    url: '/metamindapi/intent',
    headers: {
      'Authorization' : 'Bearer ' + mmToken,
      'Cache-Control' : 'no-cache',
      'X-CSRFToken': csrfCookie
    },
    contentType: false,
    processData: false,
    cache: false,
    dataType: 'json',
    data: fd
  }).done(function( retData ) {
    console.log("classifyIntent ajax done : " + JSON.stringify(retData));
    var datasetList = retData.probabilities;
    console.log("datasetList len : " + datasetList.length);
    if( datasetList.length > 0 ) {
      console.log("Intent Classification : " + datasetList[0].label);
      $(".chat").append( createLeftChatElement(d1.toUTCString(), "Astro", getBotResponseObject(datasetList[0].label)));
      $(".panel-body").animate({ scrollTop: $('.panel-body').prop("scrollHeight")}, 1000);
    }
  }).fail(function(jqXhrObj, status){
    console.log("classifyIntent ajax fail : [" + jqXhrObj.status + "] " + jqXhrObj.responseJSON.message);
    $(".chat").append( createLeftChatElement(d1.toUTCString(), "Apology", jqXhrObj.responseJSON.message));
  }).always(function(retData, status){
    console.log("classifyIntent ajax always : " + status);
  });
}

function chatWithAgent(message, idTag){
    console.log("sendChat clicked");
    var chatMessage = message;
    if( chatMessage.length > 0 ) {
      var payload = {text: chatMessage};
      liveagentSeq = liveagentSeq + 1;
      var d1 = new Date();
      $.ajax({
        method: 'POST',
        url: '/chatapi/rest/Chasitor/ChatMessage',
        headers: {
          'X-LIVEAGENT-ENDPOINT' : liveagentEndpoint,
          'X-LIVEAGENT-API-VERSION' : 40,
          'X-LIVEAGENT-AFFINITY' : affinityToken,
          'X-LIVEAGENT-SESSION-KEY': sessionKey,
          'X-LIVEAGENT-SEQUENCE': liveagentSeq,
          'X-CSRFToken': csrfCookie
        },
        dataType: "text",
        data: JSON.stringify(payload)
      }).done(function( retData ) {
        console.log("sendMsg ajax done : " + retData);
        $("#" + idTag).removeClass("glyphicon-transfer");
        $("#" + idTag).addClass("glyphicon-ok");
      }).always(function(retData, status){
        console.log("sendMsg ajax always : " + status);
      });
    }
}

function displayBotResponses() {
  $("#intentResponseList").html("");
  for (var labelKey in botResponseDataSet) {
    var divText = '<div class="panel panel-default"><div class="panel-heading">' + labelKey + '</div>';
    divText += '<div class="panel-body-eibot"><ul class="list-group">';
    for( var i = 0; i < botResponseDataSet[labelKey].length; i++ ) {
      divText += '<li class="list-group-item">' + botResponseDataSet[labelKey][i] + '</li>';
    }
    divText += '</ul></div></div>';
    $("#intentResponseList").append(divText);
  }
}

$(document).ready(function(){

  // csrfCookie = Cookies.get("csrftoken");
  csrfCookie = $("[name=csrfmiddlewaretoken]").val();
  console.log("CSRF Cookie : " + csrfCookie);

  window.setTimeout(function(){
    console.log("Show Chat Panel : " + $("#chatPanel").css( "visibility"));
    $("#chatPanel").css( "display", "block" );
  }, chatVisibleTimeout);

  displayBotResponses();

  $("#setTokens").click(function(){
    einstein_token = $("#einsteinAccessToken").val();
    einstein_modelId = $("#einsteinIntentModel").val();
    liveagentEndpoint = $("#liveagentEndpoint").val();
    liveagentEndpoint = liveagentEndpoint.replace(/^(.*\/\/[^\/?#]*).*$/,"$1");
    $("#liveagentEndpoint").val(liveagentEndpoint);
    if( $("#visitorName").val() != "" ) {
      initPayload.visitorName = $("#visitorName").val();
    }
    if ( $("#caseSubjectCreated").val() != "" ){
      preChatCaseSubject.value = $("#caseSubjectCreated").val();
    }
    if( $("#contactEmail").val() != "" ) {
      preChatContactEmail.value = $("#contactEmail").val();
    }
    initPayload.organizationId = $("#liveagentOrganization").val();
    initPayload.deploymentId = $("#liveagentDeployment").val();
    initPayload.buttonId = $("#liveagentButton").val();
    if( $("#botResponseDataSet").val() != "" && $("#botResponseFormGroup").hasClass("has-success") ) {
      var data = $.parseJSON( $("#botResponseDataSet").val() );
      for( var labelKey in data ) {
        botResponseDataSet[labelKey] = data[labelKey];
      }
      tempAlertDiv("#botResponseAlertMsg", "success", "Bot response is successfully set" );
    } else if( $("#botResponseFormGroup").hasClass("has-error") ) {
      tempAlertDiv("#botResponseAlertMsg", "danger", "JSON Parse Error : Bot response is not set" );
    }
    tempAlertDiv("#configAlertMsg", "success", "Configuration is successfully set" );
    displayBotResponses();
  });

  $("#botResponseDataSet").change(function(){
    if( $("#botResponseDataSet").val() == "" ) {
      $("#botResponseFormGroup").removeClass("has-success");
      $("#botResponseFormGroup").removeClass("has-error");
      $("#botResponseFormGroup > .text-danger").html("");
    } else {
      try {
        var data = $.parseJSON( $("#botResponseDataSet").val() );
        console.log("Bot Response JSON : " + data);
        $("#botResponseFormGroup").removeClass("has-error");
        $("#botResponseFormGroup").addClass("has-success");
        $("#botResponseFormGroup > .text-danger").html("");
      } catch(err) {
        $("#botResponseFormGroup").removeClass("has-success");
        $("#botResponseFormGroup").addClass("has-error");
        $("#botResponseFormGroup > .text-danger").html("Input is not JSON format");
      }
    }
  });

  $("#startOrEndChat").click(function(){
    if( sessionId == "" ) {
      var d1 = new Date();
      $(".chat").append( createLeftChatElement(d1.toUTCString(), "Hi", response_greeting));
      $("#sendChatMessage").removeAttr("disabled");
    } else {
      console.log("endChat clicked");
      var payload = {'reason': 'client'};
      chatPolling = false;
      sneakPeakPolling = false;
      liveagentSeq = liveagentSeq + 1;
      var d1 = new Date();
      $.ajax({
        method: 'POST',
        url: '/chatapi/rest/Chasitor/ChatEnd',
        headers: {
          'X-LIVEAGENT-ENDPOINT' : liveagentEndpoint,
          'X-LIVEAGENT-API-VERSION' : 40,
          'X-LIVEAGENT-AFFINITY' : affinityToken,
          'X-LIVEAGENT-SESSION-KEY': sessionKey,
          'X-LIVEAGENT-SEQUENCE': liveagentSeq,
          'X-CSRFToken': csrfCookie
        },
        dataType: "text",
        data: JSON.stringify(payload)
      }).done(function( retData ) {
        console.log("endChat ajax done : " + retData);
        endAndResetChat();
      }).always(function( retData, status ) {
        console.log("endChat ajax always : " + status);
      });
    }
  })

  $("#sendChat").click(function(){
    var d1 = new Date();
    var idTag = "msg_" + Date.now();
    var chatMessage = $("#sendChatMessage").val();
    $(".chat").append( createRightChatElement(d1.toUTCString(), "Me", chatMessage, idTag));
    $("#sendChatMessage").val("");
    $(".panel-body").animate({ scrollTop: $('.panel-body').prop("scrollHeight")}, 1000);
    if( sessionId == "" ) {
      $("#" + idTag).removeClass("glyphicon-transfer");
      $("#" + idTag).addClass("glyphicon-ok");
      chatWithEinsteinIntent(chatMessage, idTag);
    } else {
      chatWithAgent(chatMessage, idTag);
    }
    return false;
  });

    $("#startOrEndLAChat").click(function(){
      if(sessionId == "") {
        console.log("startChat clicked");
        $.ajax({
          method: 'GET',
          url: '/chatapi/rest/System/SessionId',
          headers: {
            'X-LIVEAGENT-ENDPOINT' : liveagentEndpoint,
            'X-LIVEAGENT-API-VERSION' : 40,
            'X-LIVEAGENT-AFFINITY' : null
          },
          dataType: 'json'
        }).done(function( retData ) {
          console.log("getSession ajax done : " + retData);
          sessionId = retData.id;
          sessionKey = retData.key;
          affinityToken = retData.affinityToken;
          clientPollTimeout = retData.clientPollTimeout;
          $("#startOrEndChat").html("End Chat");
          initChat();
        });
      } else {
        console.log("endChat clicked");
        var payload = {'reason': 'client'};
        chatPolling = false;
        sneakPeakPolling = false;
        liveagentSeq = liveagentSeq + 1;
        var d1 = new Date();
        $.ajax({
          method: 'POST',
          url: '/chatapi/rest/Chasitor/ChatEnd',
          headers: {
            'X-LIVEAGENT-ENDPOINT' : liveagentEndpoint,
            'X-LIVEAGENT-API-VERSION' : 40,
            'X-LIVEAGENT-AFFINITY' : affinityToken,
            'X-LIVEAGENT-SESSION-KEY': sessionKey,
            'X-LIVEAGENT-SEQUENCE': liveagentSeq,
            'X-CSRFToken': csrfCookie
          },
          dataType: "text",
          data: JSON.stringify(payload)
        }).done(function( retData ) {
          console.log("endChat ajax done : " + retData);
          endAndResetChat();
        }).always(function( retData, status ) {
          console.log("endChat ajax always : " + status);
        });
      }
    });

    $("#sendLAChat").click(function(){
        console.log("sendChat clicked");
        var chatMessage = $("#sendChatMessage").val();
        if( chatMessage.length > 0 ) {
          var payload = {text: chatMessage};
          liveagentSeq = liveagentSeq + 1;
          var d1 = new Date();
          var idTag = "msg_" + Date.now();
          $(".chat").append( createRightChatElement(d1.toUTCString(), "Me", chatMessage, idTag));
          $("#sendChatMessage").val('');
          $.ajax({
            method: 'POST',
            url: '/chatapi/rest/Chasitor/ChatMessage',
            headers: {
              'X-LIVEAGENT-ENDPOINT' : liveagentEndpoint,
              'X-LIVEAGENT-API-VERSION' : 40,
              'X-LIVEAGENT-AFFINITY' : affinityToken,
              'X-LIVEAGENT-SESSION-KEY': sessionKey,
              'X-LIVEAGENT-SEQUENCE': liveagentSeq,
              'X-CSRFToken': csrfCookie
            },
            dataType: "text",
            data: JSON.stringify(payload)
          }).done(function( retData ) {
            console.log("sendMsg ajax done : " + retData);
            $("#" + idTag).removeClass("glyphicon-transfer");
            $("#" + idTag).addClass("glyphicon-ok");
          }).always(function(retData, status){
            console.log("sendMsg ajax always : " + status);
          });
        }
    });

    hljs.initHighlightingOnLoad();
});
