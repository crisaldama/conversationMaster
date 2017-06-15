
/* caldama: simple heroku connect createCase sample */

require('dotenv').config({
  silent: true
});

module.exports = {
  caseCreate: function (data) {
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
							createdDate: new Date(),
							AccountID: process.env.SFORCE_CASE_ACCOUNTID,
							OwnerID: process.env.SFORCE_CASE_OWNERID,
							ContactEmail: process.env.SFORCE_CASE_CONTACT_EMAIL,
							ContactID: process.env.SFORCE_CASE_CONTACT_ID};
		  	

		  	console.log("Inserting new case with data: (" + dataToInsert.subject + ", " + dataToInsert.createdDate.getMonth() + "/" + dataToInsert.createdDate.getDay() + "/" + dataToInsert.createdDate.getFullYear() + " " 
		    + dataToInsert.createdDate.getHours() + ":" + dataToInsert.createdDate.getMinutes() + ":" + dataToInsert.createdDate.getSeconds() + ", " + dataToInsert.AccountID +  ", " + dataToInsert.OwnerID + ", " + dataToInsert.ContactEmail+ ")");
			
			var queryCount = 0;
			var query = sharedPgClient.query('INSERT INTO Salesforce.case(Subject, createdDate, AccountID, OwnerID, ContactEmail, ContactID)' + 
													' values($1, $2, $3, $4, $5, $6) RETURNING ID',
		    [dataToInsert.subject, dataToInsert.createdDate.getMonth() + "/" + dataToInsert.createdDate.getDay() + "/" + dataToInsert.createdDate.getFullYear() + " " 
		    + dataToInsert.createdDate.getHours() + ":" + dataToInsert.createdDate.getMinutes() + ":" + dataToInsert.createdDate.getSeconds(),
		    	dataToInsert.AccountID, dataToInsert.OwnerID, dataToInsert.ContactEmail, dataToInsert.ContactID], (error, result) => {
			         if (error) {
			         	console.log("Error inserting data" + err.stack);
			         }
			         else {
			         	queryCount++;
			         	console.log("Added case result is " + JSON.stringify(result));
			         	console.log("Added case row[0] is " + JSON.stringify(result.rows[0]));
			         	console.log("Added case id is " + result.rows[0].id);
			         	console.log("Added case sfid is " + result.rows[0].sfid);
					}


		    	});
			
		    sharedPgClient.query('COMMIT');

		    query.on('end', function(result) {
          		console.log("Query ended");
          		queryCount--;
           		if (result) {
               		console.log("Added case id is " + result.rows[0].Id);
           		} 
           		if (queryCount === 0) {
             		sharedPgClient.end();
             	}
        	});  


		}
		else {
			console.log("No connection available, check your db url");
		}
});
	}
}

