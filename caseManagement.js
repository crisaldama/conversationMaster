
/* caldama: simple heroku connect createCase sample */

require('dotenv').config({
  silent: true
});

var session = require('express-session');
var sleep = require('sleep');
var caseId = -1;
var sfid;
var jsforce = require('jsforce');
var conn = new jsforce.Connection();

module.exports = {
    insertTranscript: function (sfidLiveChatTranscript, tbody) {
        //sfidLiveChatTranscript=req.session.liveChatTranscript;
        conn.login(process.env.SFORCE_USERNAME, process.env.SFORCE_PWD, function(err, res) {
            if (err) { return console.error(err); }
           
            conn.sobject("LiveChatTranscript").update({Id:sfidLiveChatTranscript,
                                    Body:tbody}, function(err2, ret2) {
            if (err2 || !ret2.success) { return console.error(err2, ret2); }
            //console.log("transcriptInserted : " + tbody);
            });
	    });
    },
    createCase: function (sfidContactId) {
        return new Promise(
            function(resolve, reject){

                //sfidContactId=req.session.contactID;
                conn.login(process.env.SFORCE_USERNAME, process.env.SFORCE_PWD, function(err, res) {
                    conn.sobject("Case").create({ContactId:sfidContactId,
                                                OwnerId:process.env.SFORCE_CASE_OWNERID,
                                                Subject:process.env.SFORCE_CASE_SUBJECT}, function(err, ret2) {
                        if (err || !ret2.success) { reject(err) }
                        else {
                            console.log("Created case id : " + ret2.id);
                            resolve(ret2.id) ; 
                        }
                        
                        
                    });
                });
            }
        )
    },
    createLiveChatVisitor: function () {
        return new Promise(
            function(resolve, reject){
                 conn.login(process.env.SFORCE_USERNAME, process.env.SFORCE_PWD, function(err, res) {
                    conn.sobject("LiveChatVisitor").create({}, function(err, ret2) {
                        if (err || !ret2.success) { reject(err) }
                        else {
                        console.log("Created LiveChatVisitor id : " + ret2.id);
                            resolve(ret2.id) ;  
                        }
                        
                    });
                });
            }
        )
    },
    createLiveChatTranscript: function (sfidLiveChatVisitorID,sfidCaseID) {
        return new Promise(
            function(resolve, reject){
                //console.log("lar req es:"+req.session.LiveChatVisitorID);
                //sfidLiveChatVisitorID=req.session.LiveChatVisitorID;
                //sfidCaseID=req.session.LiveCaseID;
                //sfidContactId=req.session.contactID;
                conn.login(process.env.SFORCE_USERNAME, process.env.SFORCE_PWD, function(err, res) {
                    conn.sobject("LiveChatTranscript").create({LiveChatVisitorID:sfidLiveChatVisitorID,
                                                            OwnerID:process.env.SFORCE_CASE_OWNERID,
                                                            AccountID:process.env.SFORCE_CASE_ACCOUNTID,
                                                        CaseID:sfidCaseID}, function(err, ret2) {
                        if (err || !ret2.success) { reject(err) }
                        else {
                            console.log("Created LiveChatTranscript id : " + ret2.id);
                            resolve(ret2.id) ;
                        }
                            
                    });
                });
            }
        )
    }
}

