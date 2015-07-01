angular.module('main.controllers', [])

.controller('MainCtrl', function($rootScope) {
	$rootScope.module = 'templates/login/login.html';
	$rootScope.loggedIn = false;
	$rootScope.uid = "";
	$rootScope.authorized = false;
	
	$rootScope.navigate = function(loc) {
		switch(loc) {
			case "home":
				if( $rootScope.loggedIn )
					$rootScope.module = 'templates/nav/main.html';
				else
					$rootScope.module = 'templates/login/login.html';
				break;
				
			case "profile":
				$rootScope.module = 'templates/login/profile.html';
				break;
				
			case "settings":
				$rootScope.module = 'templates/login/settings.html';
				break;
		}
	}
})

.controller('NavCtrl', function($rootScope, $scope, Auth) {
	$scope.logout = function() {
		Auth.logout();
		$rootScope.uid = "";
		$rootScope.loggedIn = false;
		$rootScope.authorized = false;
		$rootScope.navigate('login');
	}
})

.controller('ProfileCtrl', function($scope, $rootScope, Auth) {
	$scope.pass = new Object();
	$scope.email = new Object();
	
	$scope.change = function() {
		if( $scope.pass.new != $scope.pass.newconf ) {
			alert("The two passwords don't match!");
			return;
		}
		else
			Auth.changePassword( $rootScope.uid, $scope.pass.old, $scope.pass.new );
	}
	
	$scope.changeEmail = function() {
		if( $scope.email.new != $scope.email.newconf ) {
			alert("The two emails don't match!");
			return;
		}
		else
			Auth.changeEmail( $rootScope.uid, $scope.email.new, $scope.email.pass );
	}
})

.controller('SettingsCtrl', function($scope, $rootScope, Auth) {
	$scope.create = new Object();
	
	$scope.create = function() {
		if( $scope.create.new != $scope.create.newconf ) {
			alert("The two passwords don't match!");
			return;
		}
		else
			Auth.createUser( $scope.create.email, $scope.create.new );
	}
})

.controller('LoginCtrl', function($scope, $rootScope, $timeout, Auth) {
	$scope.login = new Object();
	
	$scope.loginfailure = false;
	
	var authUsers = ["albert.deng.927@gmail.com", "summerwang95@gmail.com"];
	
	$scope.auth = function() {
		var request = Auth.login( $scope.login.email, $scope.login.password );
		request.then( function(val) {
			if( val == "FAILURE" ) {
				alert("Invalid username and/or password!");
			}
			else {
				$rootScope.navigate('home');
				$rootScope.loggedIn = true;
				$rootScope.uid = val.password.email;
				$rootScope.authorized = ( authUsers.indexOf($rootScope.uid) != -1 );
			}
		});
	}
});