
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

		var dbString = process.env.DATABASE_URL || 'postgres://localhost:5432/salesforce';

		var sharedPgClient;

		pg.connect(dbString, function(err,client){
		    if(err){
		        console.error("PG Connection Error")
		        return;
		    }
		    console.log("Connected to Postgres");
		    sharedPgClient = client;
		});

		if (sharedPgClient) {
			const data = {subject: process.env.SFORCE_CASE_SUBJECT, 
							createdDate: process.env.SFORCE_CASE_DATE || now(),
							AccountID: process.env.SFORCE_CASE_ACCOUNTID};
			sharedPgClient.query('INSERT INTO case(Subject, createdDate, AccountID) values($1, $2)',
		    [data.subject, data.createdDate, data.accountID]);
		    done();
		}

	}
}

