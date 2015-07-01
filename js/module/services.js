angular.module('main.services', [])

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
		}
	}
});