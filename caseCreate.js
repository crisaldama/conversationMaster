
/* caldama: simple heroku connect createCase sample */

require('dotenv').config({
  silent: true
});
var sleep = require('sleep');
var caseId = -1;
var sfid;
module.exports = {
  caseCreate: function (data, tbody) {
	  pg = require("pg");
		/*
		* PG Client connection
		*/
		pg.defaults.ssl = true;

		var dbString = process.env.DATABASE_URL;

		console.log ("DBSTRING is " + dbString);
		var sharedPgClient = new pg.Client(dbString);
    	sharedPgClient.on('error', function(error) {
      			console.log(error);
    	}); 
		
		sharedPgClient.connect(function (err) {
		// sharedPgClient.connect();
		// , function(err,client){
		//     if(err){
		//         console.error("PG Connection Error:" + err)
		//         return;
		//     }
		//     console.log ("Got  Postgres connection");
		//     sharedPgClient = client;
		//     /* Error handling*/
		//     sharedPgClient.on('error', function(error) {
  //     			console.log(error);
  //   		});    
		// });

		if (sharedPgClient) {
			const dataToInsert = {subject: process.env.SFORCE_CASE_SUBJECT,
							priority: process.env.SFORCE_CASE_PRIO, 
							createdDate: new Date(),
							AccountID: process.env.SFORCE_CASE_ACCOUNTID,
							OwnerID: process.env.SFORCE_CASE_OWNERID,
							ContactEmail: process.env.SFORCE_CASE_CONTACT_EMAIL,
							ContactID: process.env.SFORCE_CASE_CONTACT_ID,
							Intent: process.env.SFORCE_CASE_INTENT,
							};
		  	

		  	console.log("Inserting new case with data: (" + dataToInsert.subject + ", " + dataToInsert.createdDate.getMonth() + "/" + dataToInsert.createdDate.getDay() + "/" + dataToInsert.createdDate.getFullYear() + " " 
		    + dataToInsert.createdDate.getHours() + ":" + dataToInsert.createdDate.getMinutes() + ":" + dataToInsert.createdDate.getSeconds() + ", " + dataToInsert.AccountID +  ", " + dataToInsert.OwnerID + ", " + dataToInsert.ContactEmail+ ")");
			
			var queryCount = 0;
			var query = sharedPgClient.query('INSERT INTO Salesforce.case(Subject, priority, createdDate, AccountID, OwnerID, ContactEmail, ContactID, Main_Intent__C)' + 
													' values($1, $2, $3, $4, $5, $6, $7, $8) RETURNING ID',
		    [dataToInsert.subject, 
		    	dataToInsert.priority,
		    	dataToInsert.createdDate.getMonth() + "/" + dataToInsert.createdDate.getDay() + "/" + dataToInsert.createdDate.getFullYear() + " " 
		    		+ dataToInsert.createdDate.getHours() + ":" + dataToInsert.createdDate.getMinutes() + ":" + dataToInsert.createdDate.getSeconds(),
		    	dataToInsert.AccountID, 
		    	dataToInsert.OwnerID, 
		    	dataToInsert.ContactEmail, 
		    	dataToInsert.ContactID], 
		    	dataToInsert.Intent, (error, result) => {
			         if (error) {
			         	console.log("Error inserting data" + err.stack);
			         }
			         else {
			         	queryCount++;
			         	console.log("case result is " + JSON.stringify(result));
			         	console.log("case row[0] is " + JSON.stringify(result.rows[0]));
			         	console.log("case id is " + result.rows[0].id);
			         	caseId = result.rows[0].id;
			         	console.log("case sfid is " + result.rows[0].sfid);
					}


		    	});
			
		    sharedPgClient.query('COMMIT');

		    query.on('end', function(result) {
          		console.log("CASE Query ended");
          		// need to wait until heroku connect synchs and brings back sfid. Very bad programming technique, but hey, this is a demo
          		var sleepTime = parseInt(process.env.SFORCE_INSERT_DEFAULT_WAIT ) || 30;
          		sleep.sleep(sleepTime);
          		queryCount--;
           		if (result) {
               		//Obtain SalesforceID we need for live chat transcript
               		console.log("SELECT * from Salesforce.case where Salesforce.case.id =" + caseId);
               		query = sharedPgClient.query('SELECT * from Salesforce.case where Salesforce.case.id =' + caseId, (error, result) => {
				         if (error) {
				         	console.log("Error retreiving sfid" + error.stack);
				         }
				         else if (result) {
				         	console.log("sfidquery result="+JSON.stringify(result));
				         	console.log("sfidquery result.rows[0]="+JSON.stringify(result.rows[0]));
	           				sfid = result.rows[0].sfid;
	               			console.log("Retreived sfid: " + sfid);
	           		 
				         	queryCount++;
						}


			    	});

					query.on('end', function(result) {
	          			console.log("SFID Query ended");
	          			queryCount--;
	          			if (queryCount === 0) {
		             		console.log("queryCount is 0");
		             	}
		             	else {
		             		console.log("Pending queries, not good");
		             	}
		        	 

					  	console.log("Inserting new transcription chat for case (" + sfid + ")");
					  	console.log("Body: ", tbody);
						queryCount = 0;
						console.log('INSERT INTO Salesforce.livechattranscript(caseId, body)' + 
																' values($1, $2)', sfid, tbody);
						query = sharedPgClient.query('INSERT INTO Salesforce.livechattranscript(livechatvisitorid,caseId, body)' + 
																' values($1, $2, $3)',
					    [process.env.SFORCE_LCHAT_VISITOR_ID, sfid, tbody], (error, result) => {
						         if (error) {
						         	console.log("Error inserting data" + error.stack);
						         }
						         else {
						         	queryCount++;
								}


					    	});
						
					    sharedPgClient.query('COMMIT');

					    query.on('end', function(result) {
			          		console.log("LCHAT Query ended");
			          		queryCount--;
			           		if (result) {
			               		console.log("Added livechattranscript");
			           		} 
			           		if (queryCount === 0) {
			             		sharedPgClient.end();
			             	}
			        	}); 
	           			
	           		
	        	}); 
           		} 
           		
		});

		}
		else {
			console.log("No connection available, check your db url");
		}
});
	}
}

