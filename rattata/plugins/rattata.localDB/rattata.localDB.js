(function(app){

	var database;
	
	var core	= {
	
		create: function(options){
			var options = $.extend(options,{
				name:		'rattataDatabase'+(Math.round(new Date().getTime()/1000)),
				version: 	'1.0',
				displayName:'rattataDatabase'+(Math.round(new Date().getTime()/1000)),
				maxSize:	65536
			});

			try {
				if (!window.openDatabase) {
					return false;
				} else {
					var database = openDatabase(options.name, options.version, options.displayName, options.maxSize);
					return true;
				}
			} catch(e) {
				// Error handling code goes here.
				if (e == 2) {
					// Version number mismatch.
					WARNING("localDB: Invalid database version");
				} else {
					WARNING("localDB: Unknown error while creating database connection");
				}
				return false;
			}
		},
		
		_transactionErrorHandler: function(error){
			WARNING("localDB: Error while executing transaction (Error Code #"+error.code+"): "+error.message);
		},
		
		_transactionSuccessHandler: function(transaction, resultRowsArray){
			LOG("localDB: incoming result for transaction. You seem to have not specified a transaction callback.");
		},
		
		onTransactionError: function(callback){
			core._transactionErrorHandler	= callback;
		},
		
		onTransactionSuccess: function(callback){
			core._transactionSuccessHandler	= callback;
		},
		
		sql: function(sql,dataArray) {
			database.transaction(function(transaction){
				transaction.executeSql(sql, dataArray, core._transactionSuccessHandler, core._transactionErrorHandler);
			});
		}
	
	};
	
	app.plugins.define('localDB',core);
	
})(app);