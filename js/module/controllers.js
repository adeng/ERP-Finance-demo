angular.module('main.controllers', [])

.controller('MainCtrl', function($rootScope, Data, Helper) {
	$rootScope.module = 'templates/login/login.html';
	$rootScope.loggedIn = false;
	$rootScope.uid = "";
	$rootScope.authorized = false;
	$rootScope.curr = 'overview';
	
	Data.createChartOfAccounts();
	
	$rootScope.navigate = function(loc) {
		if( !$rootScope.loggedIn && loc != "home" ) {
			return;
		}
		
		switch(loc) {
			case "home":
				if( $rootScope.loggedIn )
					$rootScope.module = 'templates/nav/main.html';
				else
					$rootScope.module = 'templates/login/login.html';
				$rootScope.curr = 'overview';
				break;
				
			case "profile":
				$rootScope.module = 'templates/login/profile.html';
				$rootScope.curr = 'profile';
				break;
				
			case "settings":
				$rootScope.module = 'templates/login/settings.html';
				$rootScope.curr = 'admin';
				break;
				
			case "posting":
				$rootScope.module = 'templates/posting/revenue.html';
				$rootScope.curr = 'revenues';
				break;
		}
	}
})

.controller('SidebarCtrl', function($scope) {
	
})

.controller('NavCtrl', function($rootScope, $scope, Auth) {
	$scope.logout = function() {
		Auth.logout();
		$rootScope.uid = "";
		$rootScope.loggedIn = false;
		$rootScope.authorized = false;
		$rootScope.navigate('home');
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

.controller('RevenueCtrl', function($scope, Data, Helper) {
	$scope.rev = new Object();
	$scope.maxDate = new Date();
	
	$scope.today = function() {
		$scope.rev.date = new Date();
	}
	
	Helper.getRevenues().then( function( val ) {
	 	$scope.accounts = val;
	});
	
	Helper.getAssets().then( function( val ) {
		$scope.assets = val;
	});
	
	$scope.postRevenue = function() {
		
	}
})

.controller('SettingsCtrl', function($scope, $rootScope, Auth) {
	$scope.create = new Object();
	
	$scope.createUser = function() {
		if( $scope.create.new != $scope.create.newconf ) {
			alert("The two passwords don't match!");
			return;
		}
		else
			Auth.createUser( $scope.create.email, $scope.create.new );
	}
})

.controller('LoginCtrl', function($scope, $rootScope, $modal, Auth) {
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
				$rootScope.loggedIn = true;
				$rootScope.uid = val.password.email;
				$rootScope.authorized = ( authUsers.indexOf($rootScope.uid) != -1 );
				$rootScope.navigate('home');
			}
		});
	}
	
	$scope.reset = function () {
	    var modalInstance = $modal.open({
	      animation: $scope.animationsEnabled,
	      templateUrl: 'resetPassword.html',
	      controller: 'ResetPasswordCtrl',
	      size: 'sm',
	      resolve: {
	        items: function () {
	          return $scope.items;
	        }
	      }
    	});
		
		modalInstance.result.then(function (val) {
			Auth.resetPassword(val);
		});
	}	
		
})

.controller('ResetPasswordCtrl', function($scope, $modalInstance) {
	$scope.resetEmail;
	
	$scope.ok = function() {
		$modalInstance.close($scope.resetEmail);
	}
	
	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});