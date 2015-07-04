angular.module('main.services', [])

.factory('Helper', function($firebaseObject, $q) {
	var ref = new Firebase("https://msofinance.firebaseio.com");
	return {
		getQuarter: function( time ) {
			var quarters = ["1/1", "4/1", "7/1", "10/1"]
			var d = new Date(time);
			var quarter = new Date( quarters[Math.floor(d.getMonth()/3)] );
			quarter.setFullYear( d.getFullYear() ); // update year
			quarter.setDate( quarter.getDate() - 1 ); // adjust back a day
			return quarter.getTime();
		},
		getFiscalYear: function( time ) {
			var d = new Date(time);
			return (new Date("12/31").setFullYear(d.getFullYear() - 1)).getTime();	
		},
		getRevenues: function() {
			var deferred = $q.defer();
			var chart = $firebaseObject(ref.child("chart"));
			chart.$loaded().then( function( val ) {
				var accounts = new Array();
				for( var key in val ) {
					if( key[0] == "5" )
						accounts.push([key, val[key]]);
				}
				
				deferred.resolve(accounts);
			});
			return deferred.promise;
		},
		getAssets: function() {
			var deferred = $q.defer();
			var chart = $firebaseObject(ref.child("chart"));
			chart.$loaded().then( function( val ) {
				var accounts = new Array();
				for( var key in val ) {
					if( key[0] == "1" ) 
						accounts.push([key, val[key]]);
				}
				
				deferred.resolve(accounts);
			});
			return deferred.promise;
		}
	}
})

.factory('Fetch', function($firebaseObject, $q, Reporting) {
	var ref = new Firebase("https://msofinance.firebaseio.com");
	
	return {
		getSnapshot: function( time ) {
			var deferred = $q.defer();
			ref.child("snapshots").orderByKey().equalTo( (new Date(time)).getTime().toString() ).once('value', function( dataSnapshot ) {
				var data = dataSnapshot.val();
				if( data == null ) {
					Reporting.genOnTime( time ).then( function(val) {
						deferred.resolve(val);
					});
				}
				else
					deferred.resolve(data);
			});
			
			return deferred.promise;
		},
		getGLCodes: function() {
			var deferred = $q.defer();
			var fbObj = $firebaseObject(ref.child("chart"));
			fbObj.$loaded().then( function(val) { 
				deferred.resolve(val);
			});
			return deferred.promise;
		}
	}
})

.factory('Data', function($firebaseArray, $firebaseObject, Helper, Reporting) {
	var ref = new Firebase("https://msofinance.firebaseio.com");
	
	return {
		runHash: function() {
			var accounts = [1001,1002,1003,1011,1012,1021,1022,1031,1032,1041,1042,1051,1052,1053,1054,1061,1062,1063,1064,1071,2001,2002,2011,2012,2013,2021,2022,2023,2031,3001,3002,3003,3004,3011,3012,5001,5002,5003,5004,5005,5091,6001,6002,6003,6004,6005,6006,6007,6008,6009,6010,6011,6012,6013,6091,9001,9002];
			
			var data = new Array();			
			for( var i = 0; i < accounts.length; i++ ) {
				var c = accounts[i].toString();
				if( typeof data[parseInt(c[0])] == "undefined" )
					data[parseInt(c[0])] = new Array();
				if( typeof data[parseInt(c[0])][parseInt(c.substr(1, 2))] == "undefined" )
					data[parseInt(c[0])][parseInt(c.substr(1, 2))] = new Array();
				data[parseInt(c[0])][parseInt(c.substr(1, 2))][parseInt(c[3])] = accounts[i].toString(16);
			}
			
			ref.child("hash").set(data);
		},
		createChartOfAccounts: function() {
			var accounts = {1001: "Cash - On Hand", 1002: "Cash - Checking Account", 1003: "Cash - Savings Account", 1011: "Accounts Receivable", 1012: "Allowance for Doubtful Accounts", 1021: "Short-Term Investments", 1022: "Long-Term  nvestments", 1031: "Inventory", 1032: "Valuation Allowance", 1041: "Supplies", 1042: "Prepaid Expenses", 1051: "General Equipment", 1052: "Accumulated Depreciation - General", 1053: "Long-Term Equipment", 1054:  "Accumulated Depreciation - LT", 1061: "Copyrights", 1062: "Amortization - Copyrights", 1063: "Capitalized Intangibles", 1064: "Amortization - Capitalized Intangibles", 1071: "Other Assets", 2001: "Accounts Payable", 2002: "Notes Payable", 2011: "Wages Payable", 2012: "Income Taxes Payable", 2013: "Unearned Revenue", 2021: "Short-Term Debt", 2022: "Current Portion of Long-Term Debt", 2023: "Long-Term Debt", 2031: "Other Liabilities", 3001: "Common Stock", 3002: "Preferred Stock", 3003: "Additional Paid-In Capital", 3004: "Treasury Stock", 3011: "Retained Earnings", 3012: "Accumulated Other Comp Income", 5001: "Fundraiser Revenues", 5002: "Grant Revenues", 5003: "Event Revenues", 5004: "Sales Revenues", 5005: "Investment Revenues", 5006: "Gift Revenues", 5091: "Miscellaneous Revenues", 6001: "Cost of Goods Sold", 6002: "Marketing/Advertising Expenses", 6003:  "Administrative Expenses", 6011: "Transaction Expenses", 6012: "Parking Expenses", 6013: "Catering/Food Expenses", 6014: "Rent/Venues Expenses", 6015: "Transportation Expenses", 6016: "Gift Expenses", 6021: "Supplies  xpenses", 6022: "Depreciation Expense", 6023: "Bad Debt Expense", 6091: "Miscellaneous Expenses", 9001: "Gains", 9002: "Losses"}
			
			ref.child("chart").set(accounts);
		},
		createInitialRecord: function() {
			var chart = $firebaseObject(ref.child("chart"));
			var record = new Object();
			
			chart.$loaded().then( function( val ) {
				for( var key in val ) {
					if( !isNaN(parseInt(key)) )
						record[key] = 0;
				}
				
				ref.child("snapshots").child((new Date("6/30/15")).getTime()).set(record); 
			});
		},
		createTrans: function(transaction) {
			ref.child("transactions").push(transaction, function( result ) {
				if( result == null )
					alert("Transaction posted successfully!");
				else
					alert(result);
			});
		}
	}
})

.factory('Reporting', function($firebaseObject, $q, Helper) {
	var ref = new Firebase("https://msofinance.firebaseio.com");
	
	return {
		genQuarter: function( time ) {
			var deferred = $q.defer();
			var lastQ = new Date( Helper.getQuarter( (new Date).getTime(time)) );
			var oldestQ = new Date( Helper.getQuarter( new Date(lastQ.getTime()).setDate( lastQ.getDate() - 10 )));
			
			var chart = $firebaseObject(ref.child("chart"));
			var record = new Object();
			
			var transactions = ref.child("transactions").orderByChild("time").startAt(oldestQ.getTime()).endAt(lastQ.getTime());
			var lastSnap = $firebaseObject(ref.child("snapshots").child(oldestQ.getTime()));
			
			chart.$loaded().then( function( val ) {	
				for( var extra in val ) {
					if( !isNaN(parseInt(extra)) )
						record[extra] = 0;
				}
				
				lastSnap.$loaded().then( function( snap ) {

					// ensure new accounts are added properly
					for( var key in snap ) {
						if( !isNaN(parseInt(key)) )
							record[key] = snap[key];
					}
					
					transactions.once('value', function( dataSnapshot ) {
						var equity = 0;
						dataSnapshot.forEach( function(data) {
							var transaction = data.val()['transaction'];
							
							// debits
							for( var debit in transaction[0] ) {
								record[debit] += transaction[0][debit];
								if( debit[0] == "6" || debit[0] == "9" )
									equity += transaction[0][debit];
							}
							
							// credits
							for( var credit in transaction[1] ) {
								record[credit] += transaction[1][credit];
								if( credit[0] == "5" || credit[0] == "9" )
									equity += transaction[1][credit];
							}
						});
						
						record['3011'] += equity;
						
						ref.child("snapshots").child(lastQ.getTime()).set(record);
						deferred.resolve(record);
					});
				});
			});
			
			return deferred.promise;
		},
		genOnTime: function( time ) {
			var deferred = $q.defer();
			var lastQ = new Date( time );
			var oldestQ = new Date( Helper.getQuarter( (new Date(time)).getTime()));
			console.log(oldestQ.toLocaleString());
			
			var chart = $firebaseObject(ref.child("chart"));
			var record = new Object();
			
			var transactions = ref.child("transactions").orderByChild("time").startAt(oldestQ.getTime()).endAt(lastQ.getTime());
			var lastSnap = $firebaseObject(ref.child("snapshots").child(oldestQ.getTime()));
			
			chart.$loaded().then( function( val ) {	
				for( var extra in val ) {
					if( !isNaN(parseInt(extra)) )
						record[extra] = 0;
				}
				
				lastSnap.$loaded().then( function( snap ) {
					// ensure new accounts are added properly
					for( var key in snap ) {
						if( !isNaN(parseInt(key)) )
							record[key] = snap[key];
					}
					
					transactions.once('value', function( dataSnapshot ) {
						var equity = 0;
						dataSnapshot.forEach( function(data) {
							var transaction = data.val()['transaction'];
							
							// debits
							for( var debit in transaction[0] ) {
								record[debit] += transaction[0][debit];
								if( debit[0] == "6" || debit[0] == "9" )
									equity += transaction[0][debit];
							}
							
							// credits
							for( var credit in transaction[1] ) {
								record[credit] += transaction[1][credit];
								if( credit[0] == "5" || credit[0] == "9" )
									equity += transaction[1][credit];
							}
						});
						
						record['3011'] += equity;
						deferred.resolve(record);
					});
				});
			});
			
			return deferred.promise;
		}
	}
})

.factory('Auth', function($firebaseAuth, $q) {
	var ref = new Firebase("https://msofinance.firebaseio.com");
	
	var authorized = ['albert.deng.927@gmail.com', 'summerwang95@gmail.com'];
	
	return {
		login: function( username, password ) {
			var auth = $firebaseAuth(ref);
			var deferred = $q.defer(); 
			auth.$authWithPassword({
				email: username,
				password: password
			}).then( function( authData ) {
				deferred.resolve( authData );
			}).catch( function( error ) {
				deferred.resolve("FAILURE");
			});
			return deferred.promise;
		},
		logout: function() {
			var auth = $firebaseAuth(ref);
			auth.$unauth();
		},
		changePassword: function( email, oldpass, newpass ) {
			var auth = $firebaseAuth(ref);
			auth.$changePassword({
				email: email,
				oldPassword: oldpass,
				newPassword: newpass
			}).then( function() {
				alert("Password changed successfully!");
			}).catch( function(error) {
				console.log(error);
				alert("An error has occurred. Please try again.");
			});
		},
		changeEmail: function( oldemail, newemail, pass ) {
			var auth = $firebaseAuth(ref);
			auth.$changeEmail({
				oldEmail: oldemail,
				newEmail: newemail,
				password: pass
			}).then( function() {
				alert("Email changed successfully!");
			}).catch( function(error) {
				console.log(error);
				alert("An error has occurred. Please try again.");
			});
		},
		createUser: function( email, pass ) {
			var auth = $firebaseAuth(ref);
			auth.$createUser({
				email: email,
				password: pass
			}).then( function() {
				alert("User created successfully!");
			}).catch( function(error) {
				console.log(error);
				alert("An error has occurred. Please contact the system administrator.");
			});
		},
		resetPassword: function( email ) {
			var auth = $firebaseAuth(ref);
			auth.$resetPassword({
				email: email
			}).then( function() {
				alert("Password reset email sent successfully!");
			}).catch( function(error) {
				console.log(error);
				alert("An error has occurred. Please contact the system administrator.");
			});
		}
	}
});